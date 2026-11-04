"""Local stack supervisor. Invoked by start-local.ps1 inside Doppler.

Secrets stay in process environments. Frontends receive an explicit public
allowlist. Only child processes started by this invocation are terminated.
"""
from __future__ import annotations

import argparse
import ctypes
import json
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import time
import uuid
from http.cookiejar import CookieJar
from urllib.error import HTTPError
from urllib.request import build_opener, HTTPCookieProcessor
from urllib.request import Request, urlopen
from local_emulator_state import EmulatorState

ROOT = Path(__file__).resolve().parent.parent
BASE_PORTS = dict(api=8080, ml=8001, storefront=5173, devdash=3001,
                  partners=3002, auth=9099, firestore=8085, storage=9199, ui=4000,
                  hub=4400, logging=4500, websocket=9150)
PUBLIC = {'VITE_SQUARE_APPLICATION_ID', 'VITE_SQUARE_LOCATION_ID', 'VITE_AMPS_ENABLED'}
OS_ENV = {'PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'TEMP', 'TMP',
          'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'HOME', 'APPDATA', 'LOCALAPPDATA',
          'PROGRAMDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'JAVA_HOME',
          'PUB_CACHE', 'DART_HOME', 'FLUTTER_ROOT', 'FVM_CACHE_PATH', 'NUMBER_OF_PROCESSORS'}


def base_environment(source):
    return {k: v for k, v in source.items() if k.upper() in OS_ENV}


def environments(source, ports):
    backend = dict(source)
    backend.update(FIREBASE_PROJECT_ID='demo-guildmark', GOOGLE_CLOUD_PROJECT='demo-guildmark',
        FIRESTORE_DATABASE_ID='(default)', FIREBASE_STORAGE_BUCKET='demo-guildmark.firebasestorage.app',
        AUTH_MODE='firebase-emulator', FIREBASE_AUTH_EMULATOR_HOST=f"127.0.0.1:{ports['auth']}",
        WEBAUTHN_RP_ID='localhost', WEBAUTHN_RP_NAME='GuildMark Local',
        FIRESTORE_EMULATOR_HOST=f"127.0.0.1:{ports['firestore']}",
        FIREBASE_STORAGE_EMULATOR_HOST=f"127.0.0.1:{ports['storage']}",
        PORT=str(ports['api']), API_PORT=str(ports['api']), GM_LOCAL_STACK='true', PUBLIC_API_PREFIX='/api',
        ML_SERVICE_URL=f"http://127.0.0.1:{ports['ml']}", ML_RETRAIN_CRON='off',
        ML_MODEL_DIR=str(ROOT / 'ml-qv/model_artifacts'),
        CORS_ORIGIN=f"http://localhost:{ports['storefront']}",
        ADMIN_CORS_ORIGIN=f"http://localhost:{ports['devdash']}",
        PARTNER_CORS_ORIGIN=f"http://localhost:{ports['partners']}",
        SQUARE_ENVIRONMENT='sandbox', SQUARE_API_URL='https://connect.squareupsandbox.com/v2',
        ESCROW_ENVIRONMENT='sandbox', ESCROW_API_URL='https://api.escrow-sandbox.com/2017-09-01',
        FEDEX_ENVIRONMENT='sandbox', FEDEX_API_URL='https://apis-sandbox.fedex.com')
    frontend = base_environment(source)
    frontend.update({k: v for k, v in source.items() if k in PUBLIC})
    frontend.update(GM_LOCAL_STACK='true', GM_LOCAL_API_TARGET=f"http://127.0.0.1:{ports['api']}",
        VITE_API_URL='/api', VITE_IS_LAUNCH='true', VITE_IS_DEBUG='false', VITE_SQUARE_ENVIRONMENT='sandbox')
    ml = base_environment(source)
    ml.update({k: backend[k] for k in ('ML_SERVICE_TOKEN', 'ML_MODEL_DIR', 'ML_RETRAIN_CRON') if k in backend})
    return backend, frontend, ml


def free_ports(ports):
    busy = []
    for name, port in ports.items():
        for host in ('127.0.0.1', '::1'):
            try:
                with socket.create_connection((host, port), timeout=.2):
                    busy.append(f'{name} ({port})')
                    break
            except OSError:
                pass
    if busy:
        raise RuntimeError('Ports already in use: ' + ', '.join(busy) +
            '. Stop those services first, or use -PortOffset 10000. No existing processes were stopped.')


def smoke_auth(ports):
    """Exercise browser-compatible cookies through the actual frontend proxy."""
    opener = build_opener(HTTPCookieProcessor(CookieJar()))
    origin = f"http://localhost:{ports['storefront']}"
    account = {'email': f'launcher-{uuid.uuid4().hex}@example.test',
               'password': uuid.uuid4().hex, 'full_name': 'Launcher test',
               'company_name': 'Local smoke test'}

    def post(url, body, expected=200, request_origin=origin):
        request = Request(url, data=json.dumps(body).encode(), headers={
            'Content-Type': 'application/json', 'Origin': request_origin})
        try:
            with opener.open(request, timeout=15) as response:
                if response.status != expected:
                    raise RuntimeError(f'Auth smoke test expected HTTP {expected}')
                return json.load(response)
        except HTTPError as error:
            if error.code != expected:
                raise RuntimeError(f'Auth smoke test received HTTP {error.code}') from None
            return {}

    created = post(origin + '/api/auth/signup', account, 201)
    restored = post(origin + '/api/auth/refresh', {})
    if restored['user']['id'] != created['user']['id']:
        raise RuntimeError('Auth smoke test restored a different identity')
    staff_origin = f"http://localhost:{ports['devdash']}"
    post(staff_origin + '/api/admin/auth', account, 401, staff_origin)
    post(origin + '/api/auth/logout', {})
    post(origin + '/api/auth/refresh', {}, 401)
    print('[auth] Signup, cookie restore, staff denial and logout passed through Vite.', flush=True)


class WindowsJob:
    """Kernel-owned process tree: closing the supervisor kills its children."""
    def __init__(self):
        from ctypes import wintypes as w
        class Basic(ctypes.Structure):
            _fields_ = [('process_time', ctypes.c_int64), ('job_time', ctypes.c_int64),
                ('flags', w.DWORD), ('min_ws', ctypes.c_size_t), ('max_ws', ctypes.c_size_t),
                ('active', w.DWORD), ('affinity', ctypes.c_size_t), ('priority', w.DWORD), ('scheduling', w.DWORD)]
        class IO(ctypes.Structure):
            _fields_ = [(name, ctypes.c_uint64) for name in ('read_ops', 'write_ops', 'other_ops', 'read_bytes', 'write_bytes', 'other_bytes')]
        class Extended(ctypes.Structure):
            _fields_ = [('basic', Basic), ('io', IO), ('process_memory', ctypes.c_size_t),
                ('job_memory', ctypes.c_size_t), ('peak_process', ctypes.c_size_t), ('peak_job', ctypes.c_size_t)]
        self.kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        self.kernel.CreateJobObjectW.argtypes = [ctypes.c_void_p, w.LPCWSTR]
        self.kernel.CreateJobObjectW.restype = w.HANDLE
        self.kernel.SetInformationJobObject.argtypes = [w.HANDLE, ctypes.c_int, ctypes.c_void_p, w.DWORD]
        self.kernel.AssignProcessToJobObject.argtypes = [w.HANDLE, w.HANDLE]
        self.kernel.CloseHandle.argtypes = [w.HANDLE]
        self.handle = self.kernel.CreateJobObjectW(None, None)
        if not self.handle:
            raise ctypes.WinError(ctypes.get_last_error())
        limits = Extended()
        limits.basic.flags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not self.kernel.SetInformationJobObject(self.handle, 9, ctypes.byref(limits), ctypes.sizeof(limits)):
            self.close()
            raise ctypes.WinError(ctypes.get_last_error())

    def add(self, process):
        if not self.kernel.AssignProcessToJobObject(self.handle, int(process._handle)):
            process.kill()
            raise ctypes.WinError(ctypes.get_last_error())

    def close(self):
        if self.handle:
            self.kernel.CloseHandle(self.handle)
            self.handle = None


class Stack:
    def __init__(self, log_dir):
        self.logs = log_dir
        self.processes = []
        self.handles = []
        self.job = WindowsJob() if os.name == 'nt' else None

    def start(self, name, command, cwd, env):
        log_path = self.logs / f'{name}.log'
        handle = log_path.open('w', encoding='utf-8')
        self.handles.append(handle)
        if os.name == 'nt' and Path(command[0]).suffix.lower() in ('.bat', '.cmd'):
            command = [os.environ.get('COMSPEC', 'cmd.exe'), '/d', '/s', '/c', subprocess.list2cmdline(command)]
        process = subprocess.Popen(command, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
            stdout=handle, stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0,
            start_new_session=os.name != 'nt')
        if self.job:
            self.job.add(process)
        self.processes.append((name, process, log_path))
        print(f'[{name}] Starting (log: {log_path})', flush=True)
        return process

    def check(self):
        for name, process, path in self.processes:
            if process.poll() is not None:
                raise RuntimeError(f'{name} exited with code {process.returncode}. See {path}')

    def run(self, name, command, cwd, env, timeout=180):
        process = self.start(name, command, cwd, env)
        try:
            code = process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            raise RuntimeError(f'{name} timed out; see {self.logs / (name + ".log")}') from None
        if code:
            raise RuntimeError(f'{name} failed ({code}); see {self.logs / (name + ".log")}')
        self.processes = [item for item in self.processes if item[1] is not process]

    def ready(self, name, url, timeout=120, headers=None):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            self.check()
            try:
                with urlopen(Request(url, headers=headers or {}), timeout=2) as response:
                    if response.status == 200:
                        print(f'[{name}] Ready: {url}', flush=True)
                        return
            except (OSError, ValueError):
                pass
            time.sleep(.4)
        raise RuntimeError(f'{name} did not become ready: {url}. See {self.logs}')

    def close(self):
        print('\nStopping services started by this launcher...', flush=True)
        if self.job:
            self.job.close()
        else:
            for _, process, _ in reversed(self.processes):
                if process.poll() is None:
                    os.killpg(process.pid, signal.SIGTERM)
        for _, process, _ in self.processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        for handle in self.handles:
            handle.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port-offset', type=int, default=0)
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--smoke-test', action='store_true')
    parser.add_argument('--ephemeral', action='store_true')
    args = parser.parse_args()
    if not 0 <= args.port_offset <= 50000:
        raise RuntimeError('Port offset must be between 0 and 50000')
    tools = {name: shutil.which(name) for name in ('firebase', 'dart', 'dart_frog', 'node', 'java')}
    missing = [name for name, path in tools.items() if not path]
    if missing:
        raise RuntimeError('Missing tools: ' + ', '.join(missing))
    for name in ('JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_ACCESS_TTL_SECONDS', 'JWT_REFRESH_TTL_SECONDS', 'ML_SERVICE_TOKEN'):
        if not os.environ.get(name):
            raise RuntimeError(f'{name} is missing in Doppler. Update the selected development config.')
    for app in ('guildmark', 'devdash', 'partners'):
        if not (ROOT / app / 'node_modules/vite/bin/vite.js').exists():
            raise RuntimeError(f'Run pnpm install in {app} first.')
    ports = {name: port + args.port_offset for name, port in BASE_PORTS.items()}
    free_ports(ports)
    backend, frontend, ml = environments(os.environ, ports)
    if args.check_only:
        print('Tools, Doppler variables, frontend dependencies, and ports are ready. No services started.')
        return
    log_dir = ROOT / 'tmp/local-stack' / (time.strftime('%Y%m%d-%H%M%S') + f'-{os.getpid()}')
    log_dir.mkdir(parents=True)
    config = json.loads((ROOT / 'firebase.json').read_text())
    config.pop('hosting', None)
    for kind in ('firestore', 'storage'):
        for key in config[kind]:
            config[kind][key] = str(ROOT / config[kind][key])
    for kind in ('auth', 'firestore', 'storage', 'ui', 'hub', 'logging'):
        config['emulators'].setdefault(kind, {}).update(host='127.0.0.1', port=ports[kind])
    config['emulators']['firestore']['websocketPort'] = ports['websocket']
    config_path = log_dir / 'firebase.local.json'
    config_path.write_text(json.dumps(config), encoding='utf-8')
    state = None if args.ephemeral or args.smoke_test else EmulatorState(
        ROOT / 'state/local-firebase' / f'ports-{args.port_offset}', ports['hub'])
    imported = state.load() if state else None
    stack = Stack(log_dir)
    emulators_ready = False
    try:
        stack.start('firebase', [tools['firebase'], 'emulators:start', '--config', str(config_path),
            '--project', 'demo-guildmark', '--only', 'auth,firestore,storage', '--non-interactive',
            *(['--import', str(imported)] if imported else [])], log_dir, base_environment(os.environ))
        stack.ready('emulators', f"http://127.0.0.1:{ports['hub']}/emulators")
        stack.ready('auth', f"http://127.0.0.1:{ports['auth']}/emulator/v1/projects/demo-guildmark/config")
        stack.ready('firestore', f"http://127.0.0.1:{ports['firestore']}/")
        stack.ready('storage', f"http://127.0.0.1:{ports['storage']}/v0/b/demo-guildmark.firebasestorage.app/o",
            headers={'Authorization': 'Bearer owner'})
        emulators_ready = True
        stack.start('ml', [sys.executable, '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1',
            '--port', str(ports['ml']), '--reload'], ROOT / 'ml-qv', ml)
        stack.run('seed', [tools['dart'], 'run', 'tool/firebase_seed.dart', '--fixtures'], ROOT / 'api/bin', backend)
        if state:
            state.save()
            print(f'Local emulator data: {state.directory} (loaded on restart)', flush=True)
        print('Local accounts: buyer@guildmark.test, seller@guildmark.test, staff@guildmark.co', flush=True)
        print('Initial local-only password: GuildMark-local-2026! (existing passwords are preserved)', flush=True)
        # Dart Frog's interactive dev CLI requires a terminal. A generated build
        # is reliable under a supervisor and validates every route at startup.
        stack.run('api-build', [tools['dart_frog'], 'build'], ROOT / 'api/bin', backend)
        stack.start('api', [tools['dart'], 'build/bin/server.dart'], ROOT / 'api/bin', backend)
        stack.ready('api', f"http://127.0.0.1:{ports['api']}/api/config/fees")
        stack.ready('ml', f"http://127.0.0.1:{ports['ml']}/openapi.json", headers={'Authorization': 'Bearer ' + backend['ML_SERVICE_TOKEN']})
        for name, folder in [('storefront', 'guildmark'), ('devdash', 'devdash'), ('partners', 'partners')]:
            stack.start(name, [tools['node'], str(ROOT / folder / 'node_modules/vite/bin/vite.js'),
                '--host', 'localhost', '--port', str(ports[name]), '--strictPort'], ROOT / folder, frontend)
        for name in ('storefront', 'devdash', 'partners'):
            stack.ready(name, f"http://localhost:{ports[name]}/")
            stack.ready(name + ' API proxy', f"http://localhost:{ports[name]}/api/config/fees")
        print(f"\nLocal stack ready. Firebase UI: http://127.0.0.1:{ports['ui']}\nLogs: {log_dir}\nCtrl+C stops this stack. Restart the launcher after Dart API changes.", flush=True)
        if args.smoke_test:
            smoke_auth(ports)
            print('Smoke test passed; shutting down the test stack.', flush=True)
            return
        next_save = time.monotonic() + 60
        while True:
            stack.check()
            if state and time.monotonic() >= next_save:
                try: state.save()
                except Exception as error:
                    print(f'Local autosave failed; previous snapshot retained: {error}', file=sys.stderr)
                next_save = time.monotonic() + 60
            time.sleep(1)
    finally:
        try:
            if state and emulators_ready:
                # Stop API writes before the final export, keeping Firebase alive.
                for name, process, _ in stack.processes:
                    if name == 'api' and process.poll() is None:
                        process.kill()
                        process.wait(timeout=5)
                state.save()
                print(f'Local emulator data saved: {state.directory}', flush=True)
        finally:
            stack.close()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Local stack stopped.')
    except Exception as error:
        print(f'Local startup failed: {error}', file=sys.stderr)
        sys.exit(1)

"""Integration check: two isolated emulator boots; never uses normal local state.

Run with the repository's Python 3.12 environment. Firebase/Dart/Java must be on PATH.
"""
import json
import os
from pathlib import Path
import shutil
import tempfile
from urllib.request import Request, urlopen

from local_stack import ROOT, Stack, base_environment, free_ports
from local_emulator_state import EmulatorState


def main():
    ports = dict(auth=19099, firestore=18085, storage=19199, hub=14400, logging=14500, websocket=19150)
    free_ports(ports)
    with tempfile.TemporaryDirectory(prefix='guildmark-restart-', dir=ROOT / 'tmp') as directory:
        folder = Path(directory)
        config = json.loads((ROOT / 'firebase.json').read_text())
        config.pop('hosting', None)
        for kind in ('firestore', 'storage'):
            for key in config[kind]: config[kind][key] = str(ROOT / config[kind][key])
        config['emulators']['ui'] = {'enabled': False}
        for kind in ('auth', 'firestore', 'storage', 'hub', 'logging'):
            config['emulators'][kind] = {'host': '127.0.0.1', 'port': ports[kind]}
        config['emulators']['firestore']['websocketPort'] = ports['websocket']
        config_path = folder / 'firebase.json'
        config_path.write_text(json.dumps(config))
        state = EmulatorState(folder / 'state', ports['hub'])
        env = dict(base_environment(os.environ), FIREBASE_PROJECT_ID='demo-guildmark',
            FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:19099', FIRESTORE_EMULATOR_HOST='127.0.0.1:18085', LOCAL_FIXTURE_TESTS='true')

        def call(url, body=None, method=None):
            request = Request(url, data=None if body is None else json.dumps(body).encode(),
                headers={'Content-Type': 'application/json', **({'Authorization': 'Bearer owner'} if ':18085/' in url else {})}, method=method)
            with urlopen(request, timeout=15) as response: return json.load(response)

        def auth(operation, body):
            return call('http://127.0.0.1:19099/identitytoolkit.googleapis.com/v1/accounts:' + operation + '?key=local-key', body)

        db = 'http://127.0.0.1:18085/v1/projects/demo-guildmark/databases/(default)/documents/'
        uid = None
        for boot in range(2):
            stack = Stack(folder)
            try:
                imported = state.load()
                stack.start('firebase', [shutil.which('firebase'), 'emulators:start', '--config', str(config_path),
                    '--project', 'demo-guildmark', '--only', 'auth,firestore,storage', '--non-interactive',
                    *(['--import', str(imported)] if imported else [])], folder, base_environment(os.environ))
                stack.ready('auth', 'http://127.0.0.1:19099/emulator/v1/projects/demo-guildmark/config')
                stack.ready('firestore', 'http://127.0.0.1:18085/')
                stack.ready('storage', 'http://127.0.0.1:19199/v0/b/demo-guildmark.firebasestorage.app/o', headers={'Authorization': 'Bearer owner'})
                stack.run('seed', [shutil.which('dart'), 'run', 'tool/firebase_seed.dart', '--fixtures'], ROOT / 'api/bin', env)
                login = auth('signInWithPassword', {'email': 'buyer@guildmark.test',
                    'password': 'Changed-local-password-123!' if boot else 'GuildMark-local-2026!', 'returnSecureToken': True})
                if not boot:
                    uid = login['localId']
                    auth('update', {'idToken': login['idToken'], 'password': 'Changed-local-password-123!'})
                    call(db + 'assets/local-laptop-asset?updateMask.fieldPaths=reserved_quantity',
                        {'fields': {'reserved_quantity': {'integerValue': '2'}}}, 'PATCH')
                    call(db + 'employee_passkeys/restart-check', {'fields': {'employee_id': {'stringValue': 'local-staff-guildmark-co'}}}, 'PATCH')
                    call(db + 'orders/restart-check', {'fields': {'status': {'stringValue': 'payment_pending'}}}, 'PATCH')
                    # Storage is part of the same export/import cycle.
                    request = Request('http://127.0.0.1:19199/v0/b/demo-guildmark.firebasestorage.app/o?uploadType=media&name=restart-check.txt',
                        data=b'local-persistence', headers={'Authorization': 'Bearer owner', 'Content-Type': 'text/plain'}, method='POST')
                    with urlopen(request, timeout=10) as response: assert response.status == 200
                    state.save()
                else:
                    assert login['localId'] == uid, 'Firebase UID changed'
                    assert call(db + 'assets/local-laptop-asset')['fields']['reserved_quantity']['integerValue'] == '2'
                    assert call(db + 'employee_passkeys/restart-check')['fields']['employee_id']['stringValue'] == 'local-staff-guildmark-co'
                    assert call(db + 'orders/restart-check')['fields']['status']['stringValue'] == 'payment_pending'
                    request = Request('http://127.0.0.1:19199/v0/b/demo-guildmark.firebasestorage.app/o/restart-check.txt?alt=media', headers={'Authorization': 'Bearer owner'})
                    with urlopen(request, timeout=10) as response: assert response.read() == b'local-persistence'
                    staff = auth('signInWithPassword', {'email': 'staff@guildmark.co', 'password': 'GuildMark-local-2026!', 'returnSecureToken': True})
                    assert staff['localId'] != uid
                    print('PASS: identities, changed password, passkey record, stock, order and uploaded file survived restart.')
            finally:
                stack.close()


if __name__ == '__main__':
    main()

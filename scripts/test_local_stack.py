import os
from pathlib import Path
import socket
import sys
import tempfile
import time
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from local_stack import BASE_PORTS, ROOT, Stack, environments, free_ports


class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.source = dict(os.environ, JWT_ACCESS_SECRET='private-jwt',
            SQUARE_ACCESS_TOKEN='private-square', ML_SERVICE_TOKEN='private-ml',
            VITE_SQUARE_ACCESS_TOKEN='must-never-enter-vite', VITE_PRIVATE_KEY='private-key',
            VITE_SQUARE_APPLICATION_ID='public-app', VITE_SQUARE_LOCATION_ID='public-location',
            FIREBASE_PROJECT_ID='guildmark-prod', FIRESTORE_EMULATOR_HOST='remote.invalid:8080',
            PORT='8443', VITE_API_URL='http://localhost:8443', SQUARE_API_URL='https://connect.squareup.com/v2')

    def test_frontends_receive_only_public_doppler_values(self):
        _, frontend, _ = environments(self.source, BASE_PORTS)
        for name in ('JWT_ACCESS_SECRET', 'SQUARE_ACCESS_TOKEN', 'ML_SERVICE_TOKEN',
                     'VITE_SQUARE_ACCESS_TOKEN', 'VITE_PRIVATE_KEY'):
            self.assertNotIn(name, frontend)
        self.assertEqual(frontend['VITE_SQUARE_APPLICATION_ID'], 'public-app')
        self.assertEqual(frontend['VITE_API_URL'], '/api')
        self.assertEqual(frontend['GM_LOCAL_STACK'], 'true')

    def test_backend_is_pinned_to_local_emulators_and_sandbox(self):
        ports = {k: v + 10000 for k, v in BASE_PORTS.items()}
        backend, frontend, ml = environments(self.source, ports)
        self.assertEqual(backend['FIREBASE_PROJECT_ID'], 'demo-guildmark')
        self.assertEqual(backend['FIRESTORE_EMULATOR_HOST'], '127.0.0.1:18085')
        self.assertEqual(backend['PORT'], '18080')
        self.assertEqual(backend['AUTH_MODE'], 'firebase-emulator')
        self.assertEqual(backend['FIREBASE_AUTH_EMULATOR_HOST'], '127.0.0.1:19099')
        self.assertEqual(backend['WEBAUTHN_RP_ID'], 'localhost')
        self.assertEqual(backend['GM_LOCAL_STACK'], 'true')
        self.assertEqual(backend['SQUARE_API_URL'], 'https://connect.squareupsandbox.com/v2')
        self.assertEqual(backend['CORS_ORIGIN'], 'http://localhost:15173')
        self.assertEqual(frontend['GM_LOCAL_API_TARGET'], 'http://127.0.0.1:18080')
        self.assertEqual(frontend['VITE_ADMIN_AUTH_ORIGIN'], 'http://localhost:13001')
        self.assertEqual(frontend['VITE_MAIN_SITE_URL'], 'http://localhost:15173')
        self.assertEqual(frontend['VITE_AMPS_ENABLED'], 'true')
        self.assertEqual(ml['ML_SERVICE_TOKEN'], 'private-ml')
        self.assertEqual(ml['ML_RETRAIN_CRON'], 'off')
        self.assertNotIn('SQUARE_ACCESS_TOKEN', ml)
        self.assertEqual(self.source['PORT'], '8443')

    def test_busy_port_is_reported_without_stopping_owner(self):
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', 0))
            listener.listen()
            port = listener.getsockname()[1]
            with self.assertRaisesRegex(RuntimeError, 'Ports already in use: test'):
                free_ports({'test': port})
            self.assertGreater(listener.fileno(), -1)

    def test_child_tree_is_stopped_after_service_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            stack = Stack(Path(directory))
            try:
                child = stack.start('worker', [sys.executable, '-c', 'import time; time.sleep(60)'], ROOT, dict(os.environ))
                failed = stack.start('failed', [sys.executable, '-c', 'raise SystemExit(7)'], ROOT, dict(os.environ))
                failed.wait(timeout=10)
                with self.assertRaisesRegex(RuntimeError, 'failed exited with code 7'):
                    stack.check()
            finally:
                stack.close()
            self.assertIsNotNone(child.poll())


if __name__ == '__main__':
    unittest.main()

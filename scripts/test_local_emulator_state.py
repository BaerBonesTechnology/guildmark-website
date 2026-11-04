import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from local_emulator_state import EmulatorState


class StateTests(unittest.TestCase):
    def export(self, request, timeout):
        path = Path(json.loads(request.data)['path'])
        path.mkdir()
        for kind in ('auth', 'firestore', 'storage'):
            (path / kind).mkdir()
        (path / 'firebase-export-metadata.json').write_text(json.dumps({
            kind: {'path': kind} for kind in ('auth', 'firestore', 'storage')}))
        from unittest.mock import MagicMock
        result = MagicMock()
        result.__enter__.return_value.status = 200
        return result

    def test_complete_snapshots_are_loaded_and_last_three_retained(self):
        with tempfile.TemporaryDirectory() as directory:
            state = EmulatorState(directory, 4400)
            self.assertIsNone(state.load())
            with patch('local_emulator_state.urlopen', side_effect=self.export):
                for _ in range(4): latest = state.save()
            self.assertEqual(state.load(), latest)
            self.assertEqual(len(list(state.snapshots.iterdir())), 3)

    def test_failed_export_keeps_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            state = EmulatorState(directory, 4400)
            with patch('local_emulator_state.urlopen', side_effect=self.export):
                saved = state.save()
            with patch('local_emulator_state.urlopen', side_effect=OSError('offline')):
                with self.assertRaises(OSError): state.save()
            self.assertEqual(state.load(), saved)

    def test_corrupt_or_escaping_snapshot_fails_instead_of_starting_empty(self):
        with tempfile.TemporaryDirectory() as directory:
            state = EmulatorState(directory, 4400)
            state.pointer.write_text(json.dumps({'project': 'demo-guildmark', 'snapshot': '../outside'}))
            with self.assertRaises(RuntimeError): state.load()
            with patch('local_emulator_state.urlopen', side_effect=self.export): state.save()
            path = state.load()
            (path / 'auth').rmdir()
            with self.assertRaises(RuntimeError): state.load()


if __name__ == '__main__':
    unittest.main()

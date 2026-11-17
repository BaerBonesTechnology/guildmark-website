"""Crash-safe pointers to complete local Auth/Firestore/Storage exports."""
import json
import os
from pathlib import Path
import re
import shutil
import uuid
from urllib.request import Request, urlopen


class EmulatorState:
    def __init__(self, directory, hub_port):
        self.directory = Path(directory).resolve()
        self.snapshots = self.directory / 'snapshots'
        self.pointer = self.directory / 'latest.json'
        self.hub_port = hub_port

    def _snapshot(self, name):
        if not re.fullmatch(r'[a-f0-9]{32}', name):
            raise RuntimeError('Invalid local emulator snapshot name')
        path = (self.snapshots / name).resolve()
        if path.parent != self.snapshots.resolve() or not path.is_relative_to(self.directory):
            raise RuntimeError('Snapshot must remain inside its state directory')
        return path

    @staticmethod
    def _validate(path):
        metadata = json.loads((path / 'firebase-export-metadata.json').read_text(encoding='utf-8'))
        for kind in ('auth', 'firestore', 'storage'):
            child = (path / metadata[kind]['path']).resolve()
            if not child.is_relative_to(path) or not child.is_dir():
                raise RuntimeError(f'Incomplete {kind} snapshot; refusing to start empty')

    def load(self):
        if not self.pointer.exists():
            return None
        pointer = json.loads(self.pointer.read_text(encoding='utf-8'))
        if pointer.get('project') != 'demo-guildmark':
            raise RuntimeError('Local snapshot project mismatch')
        path = self._snapshot(pointer['snapshot'])
        self._validate(path)
        return path

    def save(self):
        self.snapshots.mkdir(parents=True, exist_ok=True)
        path = self._snapshot(uuid.uuid4().hex)
        # A fresh path prevents the hub's export replacement from touching an
        # existing snapshot. Advance the pointer only after a complete export.
        request = Request(f'http://127.0.0.1:{self.hub_port}/_admin/export',
            data=json.dumps({'path': str(path), 'initiatedBy': 'guildmark-local'}).encode(),
            headers={'Content-Type': 'application/json'}, method='POST')
        with urlopen(request, timeout=45) as response:
            if response.status != 200:
                raise RuntimeError('Local emulator export failed')
        self._validate(path)
        pending = self.directory / 'latest.pending.json'
        pending.write_text(json.dumps({'project': 'demo-guildmark', 'snapshot': path.name}), encoding='utf-8')
        os.replace(pending, self.pointer)
        # Retain three complete exports. Never recurse outside the designated
        # snapshot directory (including through Windows junctions/symlinks).
        candidates = []
        for entry in self.snapshots.iterdir():
            if re.fullmatch(r'[a-f0-9]{32}', entry.name) and not entry.is_symlink():
                resolved = self._snapshot(entry.name)
                if resolved.is_dir() and (resolved / 'firebase-export-metadata.json').is_file():
                    candidates.append(resolved)
        candidates.sort(key=lambda item: item.stat().st_mtime, reverse=True)
        for old in candidates[3:]:
            if old != path and old.parent == self.snapshots.resolve():
                try:
                    shutil.rmtree(old)
                except OSError:
                    pass  # A locked old backup must not invalidate a new save.
        return path

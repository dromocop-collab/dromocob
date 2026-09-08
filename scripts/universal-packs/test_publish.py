import copy, importlib.util, json, pathlib, tempfile, unittest
from unittest.mock import patch
spec = importlib.util.spec_from_file_location('packs', pathlib.Path(__file__).with_name('publish.py'))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

class PackTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        data = b'pack payload'
        (self.root / 'shared.wav').write_bytes(data)
        self.pack = {'schemaVersion': 1, 'id': 'test', 'name': 'Test', 'version': '1.0.0', 'targets': sorted(m.HOSTS), 'sharedAssets': [{'file': 'shared.wav', 'sha256': m.digest(data), 'bytes': len(data)}], 'variants': {}, 'rollback': {'previousVersion': None, 'previousManifestSHA256': None}}
        self.save()
    def save(self):
        (self.root / 'pack.json').write_bytes(m.encoded(self.pack))
    def test_dry_run_without_credentials_or_network(self):
        with patch.object(m, 'GitHub', side_effect=AssertionError('Network must not run')):
            m.publish(self.root)
    def test_hash_mismatch(self):
        (self.root / 'shared.wav').write_bytes(b'bad')
        with self.assertRaises(ValueError): m.validate(self.pack, self.root)
    def test_invalid_host_and_uncovered_host(self):
        self.pack['targets'] = ['unknown']
        with self.assertRaises(ValueError): m.validate(self.pack)
        self.pack['targets'] = ['resolve']; self.pack['sharedAssets'] = []
        with self.assertRaises(ValueError): m.validate(self.pack)
    def test_traversal_duplicates_and_symlinks(self):
        asset = self.pack['sharedAssets'][0]
        asset['file'] = '../escape'
        with self.assertRaises(ValueError): m.validate(self.pack)
        asset['file'] = 'shared.wav'; self.pack['sharedAssets'].append(dict(asset))
        with self.assertRaises(ValueError): m.validate(self.pack)
        self.pack['sharedAssets'].pop()
        (self.root / 'shared.wav').unlink(); (self.root / 'shared.wav').symlink_to('/etc/hosts')
        with self.assertRaises(ValueError): m.validate(self.pack, self.root)
    def test_rollback_requires_hash(self):
        self.pack['rollback']['previousVersion'] = '0.9.0'
        with self.assertRaises(ValueError): m.validate(self.pack)
    def test_commit_is_namespace_scoped_and_fast_forward(self):
        api = object.__new__(m.GitHub); calls = []
        def call(path, method='GET', data=None):
            calls.append((path, data)); return {'sha': 'new'}
        api.call = call
        api.commit('old', 'tree', {m.PREFIX + 'manifest.json': b'{}'})
        self.assertEqual(calls[-1], ('git/refs/heads/main', {'sha': 'new', 'force': False}))
        self.assertEqual(calls[-2][1]['parents'], ['old'])
        with self.assertRaises(ValueError): api.commit('old', 'tree', {'public/downloads/latest.json': b'{}'})
    def test_publish_uploads_before_atomic_catalog_and_does_not_mark_latest(self):
        calls, commits = [], []
        before = m.encoded({'schemaVersion': 1, 'packs': []})
        payload = (self.root / 'shared.wav').read_bytes()
        class Response:
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def read(self): return payload
        class API:
            def call(self, path, method='GET', data=None, raw=None):
                calls.append((path, method, data))
                if path == 'git/ref/heads/main': return {'object': {'sha': 'head'}}
                if path == 'git/commits/head': return {'tree': {'sha': 'tree'}}
                if path.startswith('git/trees/'): return {'tree': []}
                if path == 'releases': return {'id': 7, 'upload_url': 'https://uploads.github.com/release/assets{?name}'}
                if '?name=' in path: return {'size': len(raw), 'browser_download_url': 'https://github.com/fixture/shared.wav'}
                return {}
            def read(self, path, ref): return before
            def commit(self, head, tree, files): commits.append(files); return 'commit'
        with patch.object(m, 'GitHub', API), patch.object(m.urllib.request, 'urlopen', return_value=Response()):
            m.publish(self.root, False)
        self.assertEqual(calls[3][2]['tag_name'], 'ultra-pack-test-v1.0.0')
        self.assertEqual(calls[3][2]['make_latest'], 'false')
        self.assertEqual(calls[-1], ('releases/7', 'PATCH', {'draft': False, 'make_latest': 'false'}))
        self.assertTrue(all(path.startswith(m.PREFIX) for path in commits[0]))
        result = json.loads(commits[0][m.PREFIX + 'manifest.json'])
        self.assertEqual(result['packs'][0]['sharedAssets'][0]['url'], 'https://github.com/fixture/shared.wav')
        self.assertEqual(result['packs'][0]['manifestSHA256'], m.digest(commits[0][m.PREFIX + 'releases/test/1.0.0/pack.json']))
        commits.clear()
        payload = b'corrupt download'
        with patch.object(m, 'GitHub', API), patch.object(m.urllib.request, 'urlopen', return_value=Response()):
            with self.assertRaises(ValueError): m.publish(self.root, False)
        self.assertFalse(commits, 'Hash failure must never activate catalog')
    def test_rollback_preserves_other_packs_and_history(self):
        oldpack = copy.deepcopy(self.pack); oldpack['version'] = '0.9.0'
        current = dict(self.pack, manifestSHA256='a'*64)
        other = dict(current, id='other')
        before = m.encoded({'schemaVersion': 1, 'packs': [current, other]})
        class API:
            saved = None
            def call(self, path):
                return {'object': {'sha': 'head'}} if path.startswith('git/ref/') else {'tree': {'sha': 'tree'}}
            def read(self, path, ref):
                return before if path.endswith('manifest.json') else m.encoded(oldpack)
            def commit(self, head, tree, files):
                API.saved = files; return 'commit'
        with patch.object(m, 'GitHub', API): m.publish(self.root, False, '0.9.0')
        result = json.loads(API.saved[m.PREFIX + 'manifest.json'])
        self.assertEqual(result['previousRevisionSHA256'], m.digest(before))
        self.assertEqual(result['packs'][0], other)
        self.assertEqual(result['packs'][1]['version'], '0.9.0')
        self.assertEqual(API.saved[m.PREFIX + 'history/' + m.digest(before) + '.json'], before)

if __name__ == '__main__': unittest.main()

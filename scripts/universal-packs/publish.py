#!/usr/bin/env python3
"""Independent Universal Packs publisher. No AE imports, settings or paths."""
import argparse, base64, hashlib, json, os, pathlib, re, shutil, subprocess, sys, urllib.request, urllib.error, uuid

PREFIX = 'public/downloads/ultra/packs/'
HOSTS = {'after-effects', 'premiere', 'final-cut', 'resolve'}
REPO = 'dromocop-collab/dromocob'
BRANCH = 'main'

def encoded(value):
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + '\n').encode()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def require(ok, message):
    if not ok:
        raise ValueError(message)

def validate(pack, folder=None):
    require(isinstance(pack, dict) and pack.get('schemaVersion') == 1, 'Invalid schema version')
    require(set(pack) == {'schemaVersion', 'id', 'name', 'version', 'targets', 'sharedAssets', 'variants', 'rollback'}, 'Unknown or missing pack fields')
    require(re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', pack.get('id', '')), 'Invalid pack id')
    require(re.fullmatch(r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)', pack.get('version', '')), 'Invalid version')
    require(isinstance(pack.get('name'), str) and 0 < len(pack['name']) <= 200, 'Invalid name')
    targets = pack.get('targets', [])
    require(isinstance(targets, list) and targets and len(set(targets)) == len(targets) and set(targets) <= HOSTS, 'Invalid host targets')
    shared, variants = pack.get('sharedAssets'), pack.get('variants')
    require(isinstance(shared, list) and isinstance(variants, dict) and set(variants) <= set(targets), 'Invalid payload variants')
    require(all(isinstance(v, list) and v for v in variants.values()), 'Empty host variant')
    require(all(shared or variants.get(t) for t in targets), 'Target has no compatible payload')
    rollback = pack.get('rollback')
    require(isinstance(rollback, dict) and set(rollback) == {'previousVersion', 'previousManifestSHA256'}, 'Invalid rollback metadata')
    if rollback['previousVersion'] is not None:
        require(re.fullmatch(r'\d+\.\d+\.\d+', rollback['previousVersion']) and re.fullmatch(r'[a-f0-9]{64}', rollback.get('previousManifestSHA256') or ''), 'Invalid rollback reference')
    else:
        require(rollback['previousManifestSHA256'] is None, 'Invalid initial rollback reference')
    files = shared + [a for values in variants.values() for a in values]
    names = set()
    for asset in files:
        require(isinstance(asset, dict) and {'file', 'sha256', 'bytes'} <= set(asset) <= {'file', 'sha256', 'bytes', 'url'}, 'Unknown or missing asset fields')
        name = asset.get('file', '')
        require(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,180}', name) and name not in names and name != 'pack.json', 'Unsafe or duplicate filename')
        names.add(name)
        require(re.fullmatch(r'[a-f0-9]{64}', asset.get('sha256', '')), 'Invalid SHA-256')
        require(type(asset.get('bytes')) is int and asset['bytes'] > 0, 'Invalid asset size')
        if folder:
            path = folder / name
            require(path.is_file() and not path.is_symlink(), 'Missing or symbolic asset')
            require(path.stat().st_size == asset['bytes'] and digest(path.read_bytes()) == asset['sha256'], 'Asset integrity mismatch')
    return files

class GitHub:
    def __init__(self):
        token = os.environ.get('UNIVERSAL_PACKS_GITHUB_TOKEN', '')
        if not token:
            gh = shutil.which('gh') or next((p for p in ['/opt/homebrew/bin/gh', '/usr/local/bin/gh'] if pathlib.Path(p).is_file()), None)
            require(gh, 'Set UNIVERSAL_PACKS_GITHUB_TOKEN or authenticate GitHub CLI')
            result = subprocess.run([gh, 'auth', 'token'], capture_output=True, text=True)
            require(result.returncode == 0, 'GitHub CLI authentication unavailable')
            token = result.stdout.strip()
        require(token, 'Missing pack publishing credential')
        self.token = token

    def call(self, path, method='GET', data=None, raw=None):
        url = path if path.startswith('https://uploads.github.com/') else 'https://api.github.com/repos/' + REPO + '/' + path
        body = raw if raw is not None else (encoded(data) if data is not None else None)
        req = urllib.request.Request(url, body, method=method, headers={'Authorization': 'Bearer ' + self.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/octet-stream' if raw is not None else 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            # Never include response bodies, headers or credentials in logs.
            raise ValueError('GitHub request failed (HTTP %s); catalog unchanged unless final ref update succeeded' % error.code) from None

    def read(self, path, ref):
        require(path.startswith(PREFIX), 'Path outside Universal Packs namespace')
        from urllib.parse import quote
        entry = self.call('contents/' + path + '?ref=' + quote(ref, safe=''))
        return base64.b64decode(entry['content'])

    def commit(self, head, tree, files):
        entries = []
        for path, body in files.items():
            require(path.startswith(PREFIX), 'Path outside Universal Packs namespace')
            blob = self.call('git/blobs', 'POST', {'content': base64.b64encode(body).decode(), 'encoding': 'base64'})
            entries.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})
        new_tree = self.call('git/trees', 'POST', {'base_tree': tree, 'tree': entries})
        commit = self.call('git/commits', 'POST', {'message': 'content: publish Universal Packs catalog', 'tree': new_tree['sha'], 'parents': [head]})
        # Fast-forward only: a concurrent AE/main update rejects this commit safely.
        self.call('git/refs/heads/' + BRANCH, 'PATCH', {'sha': commit['sha'], 'force': False})
        return commit['sha']

def publish(folder, dry_run=True, rollback=None):
    pack = json.loads((folder / 'pack.json').read_bytes())
    assets = validate(pack, folder)
    if dry_run:
        print('PASS: pack schema and %d payload hashes; no network or AE writes' % len(assets))
        return
    api = GitHub()
    head = api.call('git/ref/heads/' + BRANCH)['object']['sha']
    tree = api.call('git/commits/' + head)['tree']['sha']
    old_bytes = api.read(PREFIX + 'manifest.json', head)
    catalog = json.loads(old_bytes)
    require(catalog.get('schemaVersion') == 1 and isinstance(catalog.get('packs'), list), 'Invalid current catalog')
    prior = next((p for p in catalog['packs'] if p['id'] == pack['id']), None)
    if rollback:
        saved = api.read(PREFIX + 'releases/' + pack['id'] + '/' + rollback + '/pack.json', head)
        restored = json.loads(saved)
        require(restored.get('id') == pack['id'] and restored.get('version') == rollback, 'Rollback identity mismatch')
        pack = restored
        validate(pack)
        require(prior is not None and prior['version'] != rollback, 'Rollback target is already active or missing')
        entry = dict(pack, manifestSHA256=digest(saved))
        # Immutable metadata already holds verified URLs from its original publication.
        files = {}
    else:
        if prior:
            require(tuple(map(int, pack['version'].split('.'))) > tuple(map(int, prior['version'].split('.'))), 'Version must increase; use explicit rollback to restore')
            require(pack['rollback'] == {'previousVersion': prior['version'], 'previousManifestSHA256': prior['manifestSHA256']}, 'Stale rollback metadata; refresh from live catalog')
        else:
            require(pack['rollback']['previousVersion'] is None, 'First release cannot reference previous version')
        history = api.call('git/trees/' + tree + '?recursive=1')
        require(not history.get('truncated'), 'Repository tree is too large to verify immutable release history')
        release_path = PREFIX + 'releases/' + pack['id'] + '/' + pack['version'] + '/pack.json'
        require(not any(item['path'] == release_path for item in history['tree']), 'Version already published; use a new version or explicit rollback')
        tag = 'ultra-pack-' + pack['id'] + '-v' + pack['version']
        # A unique tag prevents collisions with AE v{version} releases. Draft first.
        release = api.call('releases', 'POST', {'tag_name': tag, 'target_commitish': head, 'name': 'Universal Pack: ' + pack['name'] + ' ' + pack['version'], 'draft': True, 'make_latest': 'false'})
        for asset in assets:
            uploaded = api.call(release['upload_url'].split('{')[0] + '?name=' + asset['file'], 'POST', raw=(folder / asset['file']).read_bytes())
            require(uploaded['size'] == asset['bytes'], 'Uploaded size mismatch')
            asset['url'] = uploaded['browser_download_url']
        manifest = encoded(pack)
        api.call(release['upload_url'].split('{')[0] + '?name=pack.json', 'POST', raw=manifest)
        api.call('releases/' + str(release['id']), 'PATCH', {'draft': False, 'make_latest': 'false'})
        for asset in assets:
            # Public download: no token is sent through GitHub/CDN redirects.
            with urllib.request.urlopen(asset['url'], timeout=180) as response:
                require(digest(response.read()) == asset['sha256'], 'Public payload SHA-256 mismatch; catalog not updated')
        entry = dict(pack, manifestSHA256=digest(manifest))
        files = {PREFIX + 'releases/' + pack['id'] + '/' + pack['version'] + '/pack.json': manifest}
    updated = {'schemaVersion': 1, 'revision': str(uuid.uuid4()), 'previousRevisionSHA256': digest(old_bytes), 'packs': [p for p in catalog['packs'] if p['id'] != pack['id']] + [entry]}
    files[PREFIX + 'history/' + digest(old_bytes) + '.json'] = old_bytes
    files[PREFIX + 'manifest.json'] = encoded(updated)
    commit = api.commit(head, tree, files)
    print('Published Universal Packs catalog commit ' + commit)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', required=True, type=pathlib.Path)
    parser.add_argument('--publish', action='store_true', help='Explicitly publish to GitHub main')
    parser.add_argument('--rollback', help='Restore an immutable previously published version')
    args = parser.parse_args()
    if args.rollback:
        require(re.fullmatch(r'\d+\.\d+\.\d+', args.rollback), 'Invalid rollback version')
    publish(args.bundle, dry_run=not args.publish, rollback=args.rollback)

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Error type/message from our validations only; no arbitrary upstream data.
        print(str(error) if isinstance(error, ValueError) else 'Pack operation failed; inspect local configuration and retry safely', file=sys.stderr)
        sys.exit(1)

"""Scoped portfolio operations. No physical asset deletion; append-only recovery journal."""
import copy
import uuid
import json
from pathlib import Path
import re
import tempfile


def read_history(path):
    history = json.loads(Path(path).read_text(encoding='utf-8')) if Path(path).exists() else empty_history()
    if history.get('version') != 1 or not isinstance(history.get('actions'), list):
        raise RuntimeError('Unknown portfolio recovery journal; stop')
    ids = [a['id'] for a in history['actions']]
    if len(ids) != len(set(ids)):
        raise RuntimeError('Duplicate recovery journal IDs')
    return history


def assert_applied(manifest, history, operation):
    action = next((a for a in history['actions'] if a['id'] == operation['id']), None)
    if not action or action['changes'] != operation['changes']:
        raise RuntimeError('Accepted operation journal missing/changed')
    for name, change in operation['changes'].items():
        if manifest.get(name) != change['after'] or revision(history, name) != operation['id']:
            raise RuntimeError('Accepted operation removed/changed remotely; will not restore it')


def assert_upload_allowed(manifest, history, items):
    for item in items:
        missing = set(item['categories']) - set(manifest.get(item['dest'], {}).get('categories', []))
        for action in history['actions']:
            change = action['changes'].get(item['dest'])
            if change:
                removed = set((change['before'] or {}).get('categories', [])) - set((change['after'] or {}).get('categories', []))
                if missing & removed:
                    raise RuntimeError('Portfolio tombstone: removed links require explicit recovery, not stale upload')


def read_catalog(root, candidate=None):
    """Fresh trusted Git main, not a stale local manifest. No writes to source repo."""
    import safe_photo_publisher as core
    configured = core.git(root, 'remote', 'get-url', 'origin', check=False)
    remote = configured.stdout.strip() if configured.returncode == 0 else core.REMOTE
    with tempfile.TemporaryDirectory(prefix='clc-catalog-') as directory:
        work = Path(directory)
        core.git(work, 'init')
        core.git(work, 'remote', 'add', 'origin', remote)
        core.sparse_main(work)
        core.git(work, 'fetch', '--filter=blob:none', '--no-tags', 'origin', 'main')
        sha = core.git(work, 'rev-parse', 'FETCH_HEAD').stdout.strip()
        core.git(work, 'checkout', '--detach', sha)
        manifest = json.loads((work / 'data/portfolio-tags.json').read_text(encoding='utf-8'))
        history = read_history(work / 'data/portfolio-history.json')
        source = (work / 'data/portfolio.ts').read_text(encoding='utf-8')
        meta = re.search(r'const CATEGORY_META\b[^=]*=\s*\[(.*?)\]', source, re.S)
        if not meta:
            raise RuntimeError('Remote category metadata missing')
        categories = re.findall(r"id:\s*'([a-z0-9-]+)'", meta.group(1))
        labels = dict(re.findall(r"id:\s*'([a-z0-9-]+)'\s*,\s*label:\s*'([^']*)'", meta.group(1)))
        expected_index = core.generate_index(work)
        hashes = expected_index['sha256']
        candidate_accepted = False
        if candidate:
            if not re.fullmatch(r'[a-f0-9]{40}', candidate):
                raise ValueError('Invalid candidate SHA')
            candidate_accepted = core.git(work, 'merge-base', '--is-ancestor', candidate, sha, check=False).returncode == 0
        return {'sha': sha, 'remote': remote, 'manifest': manifest, 'history': history,
                'hashes': hashes, 'categories': categories, 'labels': labels,
                'expected_index': expected_index, 'candidate_accepted': candidate_accepted}


def cancel_operation(root, newdir):
    """Explicit local discard only after fresh proof no push was accepted.

    Never removes a receipt, changes input tags, or attempts to undo a push.
    """
    import safe_photo_publisher as core
    operation = core.load_batch(newdir)
    if not operation or operation.get('kind') != 'edit' or operation.get('complete'):
        raise RuntimeError('No pending edit to cancel; uploads must retain their recovery receipt')
    snapshot = read_catalog(root, operation.get('candidate_sha'))
    if operation.get('remote') and operation['remote'] != snapshot['remote']:
        raise RuntimeError('Remote changed; cannot prove cancellation safe')
    if (operation.get('pushed_sha') or snapshot['candidate_accepted']
            or any(a['id'] == operation['id'] for a in snapshot['history']['actions'])):
        raise RuntimeError('Operation already accepted; retry verification or use explicit recovery')
    operation['cancelled'] = True
    operation['complete'] = True
    core.atomic_json(Path(newdir) / '.publisher/cancelled' / (operation['id'] + '.json'), operation)
    core.save_batch(newdir, operation)
    return operation



def empty_history():
    return {'version': 1, 'actions': []}


def revision(history, name):
    return next((a['id'] for a in reversed(history['actions']) if name in a['changes']), None)


def prepare_edit(snapshot, names, categories):
    categories = list(dict.fromkeys(categories))
    changes = {}
    for name in names:
        before = snapshot['manifest'][name]
        after = copy.deepcopy(before)
        after['categories'] = categories.copy()
        after['order'] = copy.deepcopy(before.get('order', {}))
        for cat in before['categories']:
            if cat not in categories:
                after['order'].pop(cat, None)
        for cat in categories:
            if cat not in before['categories']:
                orders = [m.get('order', {}).get(cat, 1) for m in snapshot['manifest'].values() if cat in m['categories']]
                after['order'][cat] = min(orders, default=1) - len(names) + len(changes)
        if not categories:
            after = None
        if after != before:
            changes[name] = {'before': copy.deepcopy(before), 'after': after,
                             'sha256': snapshot['hashes'][name],
                             'revision': revision(snapshot['history'], name)}
    if not changes:
        raise ValueError('No portfolio changes selected')
    return {'version': 2, 'kind': 'edit', 'id': uuid.uuid4().hex, 'changes': changes,
            'remote': snapshot.get('remote'),
            'candidate_sha': None, 'pushed_sha': None, 'verified': False, 'complete': False}


def prepare_undo(snapshot, action_id):
    action = next(a for a in snapshot['history']['actions'] if a['id'] == action_id)
    changes = {}
    for name, change in action['changes'].items():
        if snapshot['manifest'].get(name) != change['after'] or revision(snapshot['history'], name) != action_id:
            raise RuntimeError('Recovery conflict: target changed; refresh catalog')
        changes[name] = {'before': copy.deepcopy(change['after']), 'after': copy.deepcopy(change['before']),
                         'sha256': change['sha256'], 'revision': action_id}
    return {'version': 2, 'kind': 'edit', 'id': uuid.uuid4().hex, 'undo_of': action_id,
            'remote': snapshot.get('remote'),
            'changes': changes, 'candidate_sha': None, 'pushed_sha': None, 'verified': False, 'complete': False}


def apply_operation(manifest, history, operation):
    result, journal = copy.deepcopy(manifest), copy.deepcopy(history)
    for name, change in operation['changes'].items():
        if manifest.get(name) != change['before'] or revision(history, name) != change['revision']:
            raise RuntimeError('Portfolio conflict: target changed; refresh catalog')
    for name, change in operation['changes'].items():
        if change['after'] is None:
            result.pop(name, None)
        else:
            result[name] = copy.deepcopy(change['after'])
    journal['actions'].append({key: copy.deepcopy(operation[key]) for key in ('id', 'changes', 'undo_of') if key in operation})
    return result, journal

"""Prepare/check the static snapshot used by this repository's branch Pages source.
Only build outputs are copied; unrelated original source/assets are preserved.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil

root = Path(__file__).resolve().parents[1]
inputs = [p for folder in ['src', 'public'] for p in (root / folder).rglob('*') if p.is_file()]
inputs += [root / name for name in ['package.json', 'package-lock.json', 'next.config.mjs', 'postcss.config.mjs', 'tailwind.config.ts', 'tsconfig.json', 'next-env.d.ts']]
hash_value = hashlib.sha256()
for path in sorted(inputs):
    hash_value.update(path.relative_to(root).as_posix().encode() + b'\0' + path.read_bytes())
fingerprint = hash_value.hexdigest()
record = root / '.static-export-source.sha256'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
if args.check:
    if not record.exists() or record.read_text().strip() != fingerprint:
        raise SystemExit('Static snapshot is stale. Run npm run publish:prepare and commit the generated files.')
    print('PASS: published static snapshot matches the current application inputs')
else:
    output = root / 'out'
    if not (output / 'index.html').exists():
        raise SystemExit('Run npm run build first.')
    files = []
    allowed = {'_next', 'assets', 'video', '404', 'index.html', 'index.txt', '404.html', 'resume.html', '.nojekyll'}
    for source in sorted(output.rglob('*')):
        if not source.is_file():
            continue
        relative = source.relative_to(output)
        if relative.parts[0] not in allowed or source.is_symlink():
            raise SystemExit(f'Unexpected build output: {relative}')
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        files.append(relative.as_posix())
    record.write_text(fingerprint + '\n')
    (root / '.static-export-files.json').write_text(json.dumps(files, indent=2) + '\n')
    print(f'Prepared {len(files)} static files; original unrelated files were preserved')

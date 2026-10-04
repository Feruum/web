"""Run the official Nu Html Checker locally. No HTML is uploaded anywhere."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import subprocess
import json
import hashlib
import sys
from datetime import datetime, timezone

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('jar', type=Path, help='Path to the official vnu.jar (Java 17+ required)')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
pages = sorted(root.glob('*.html'))
command = ['java', '-jar', str(args.jar.resolve()), '--format', 'json', '--stdout', '--skip-non-html', *[str(p) for p in pages]]
result = subprocess.run(command, capture_output=True, encoding='utf-8', errors='replace')
try:
    output = json.loads(result.stdout)
except json.JSONDecodeError:
    print(result.stdout, result.stderr)
    sys.exit(1)
report = {
    'checked_at': datetime.now(timezone.utc).isoformat(),
    'mode': 'official Nu checker, local files only',
    'validator_version': output.get('version'),
    'validator_jar_sha256': hashlib.sha256(args.jar.read_bytes()).hexdigest(),
    'pages': [],
}
for page in pages:
    messages = [m for m in output.get('messages', []) if Path(unquote(urlsplit(m.get('url', '')).path)).name == page.name]
    errors = [m for m in messages if m.get('type') == 'error']
    warnings = [m for m in messages if m.get('subType') == 'warning']
    report['pages'].append({'page': page.name, 'sha256': hashlib.sha256(page.read_bytes()).hexdigest(), 'messages': messages, 'error_count': len(errors), 'warning_count': len(warnings)})
    print(f'{page.name}: {len(errors)} errors, {len(warnings)} warnings')
    for message in messages:
        print(f"  line {message.get('lastLine', '?')}: {message.get('message')}")
target = root / 'docs/checks/w3c.json'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
sys.exit(result.returncode)

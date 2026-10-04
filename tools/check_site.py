"""Audit the static site; not loaded by any page. Requires lxml."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
from collections import Counter
import re
import sys
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.glob('*.html'))
docs = {p.name: html.fromstring(p.read_text(encoding='utf-8')) for p in PAGES}
errors = []
def check(ok, message):
    if not ok:
        errors.append(message)

footer = None
nav = None
for page in PAGES:
    name, doc = page.name, docs[page.name]
    ids = [e.get('id') for e in doc.xpath('//*[@id]')]
    check(len(ids) == len(set(ids)), f'{name}: duplicate ids')
    check(all(re.fullmatch(r'[a-z][a-z0-9-]*', i) for i in ids), f'{name}: ids must be lowercase kebab-case')
    check(len(doc.xpath('//h1')) == 1, f'{name}: expected one h1')
    check(len(doc.xpath('//main')) == 1, f'{name}: expected one main')
    if name != 'colophon.html':
        check(not re.search(r'classroom|practice form|classroom demonstration', doc.text_content(), re.I), f'{name}: visitor copy contains classroom scaffolding')
    check('1,811 ratings' not in doc.text_content(), f'{name}: outdated rating count remains')
    links = [e.get('href') for e in doc.xpath('//nav[@aria-label="Main navigation"]//a[contains(@class,"nav-link")]')]
    if nav is None:
        nav = links
    check(links == nav, f'{name}: navigation differs')
    check(set(links) == set(docs) - {'colophon.html'}, f'{name}: header must reach the seven visitor pages')
    footer_links = {e.get('href') for e in doc.xpath('//nav[@aria-label="Footer navigation"]//a')}
    check(footer_links == set(docs), f'{name}: footer must reach all eight pages including Colophon')
    check(not doc.xpath('//nav//li[contains(@class,"d-none")]'), f'{name}: navigation page is hidden')
    footers = doc.xpath('//body/footer')
    current_footer = html.tostring(footers[0]) if footers else b''
    if footer is None:
        footer = current_footer
    check(current_footer == footer, f'{name}: footer differs')
    check('Istanbul Restaurant Astana' in doc.findtext('.//title'), f'{name}: inconsistent title')
    for elem in doc.xpath('//*[@href or @src or @action]'):
        for attr in ('href', 'src', 'action'):
            ref = elem.get(attr)
            if ref is None:
                continue
            check(ref not in ('', '#'), f'{name}: empty {attr} link')
            url = urlsplit(ref)
            if url.scheme or url.netloc:
                continue
            target_name = unquote(url.path) or name
            target = ROOT / target_name
            check(target.exists(), f'{name}: missing {target_name}')
            if url.fragment and target_name in docs:
                check(unquote(url.fragment) in [e.get('id') for e in docs[target_name].xpath('//*[@id]')], f'{name}: missing anchor {ref}')
    for elem in doc.xpath('//*[@aria-labelledby or @aria-describedby or @aria-controls]'):
        for attr in ('aria-labelledby', 'aria-describedby', 'aria-controls'):
            for ref in (elem.get(attr) or '').split():
                check(ref in ids, f'{name}: missing {attr} target {ref}')
    for label in doc.xpath('//label[@for]'):
        check(label.get('for') in ids, f'{name}: label target missing')
    for elem in doc.xpath('//form | //input | //select | //textarea | //button'):
        check(bool(elem.get('id')), f'{name}: {elem.tag} lacks JavaScript id')
    for form in doc.xpath('//form'):
        result = urlsplit(form.get('action', '')).fragment
        check(result in ids, f'{name}: form lacks result target')
        check(bool(form.get('aria-describedby')), f'{name}: form lacks submission explanation')
        check(bool(form.xpath('.//*[@role="alert"]')), f'{name}: form lacks error container')
    for elem in doc.xpath('//em[@aria-label]'):
        check(bool(elem.text_content().strip()), f'{name}: empty price element')
    for img in doc.xpath('//img'):
        check(img.get('alt') is not None, f'{name}: image lacks alt')
    check(not re.search(r'(?m)^(<<<<<<<|=======|>>>>>>>)', page.read_text(encoding='utf-8')), f'{name}: conflict markers')

if errors:
    print('\n'.join(f'FAIL {message}' for message in errors))
    print(f'{len(errors)} findings across {len(PAGES)} pages')
    sys.exit(1)
print(f'PASS: {len(PAGES)} pages; navigation, footers, local links/anchors, ids, labels, form hooks and assets')

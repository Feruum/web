/* Development/QA tooling only. No website page loads this script. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.SITE_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const origin = process.env.SITE_URL || 'http://127.0.0.1:4173';
const names = ['index', 'menu', 'visit', 'gallery', 'about', 'faq', 'feedback', 'colophon'];
const chrome = process.env.SITE_CHROME || path.join(process.env.ProgramFiles || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe');
const screenshotDir = path.join(root, 'docs/screenshots');
const evidenceDir = path.join(root, 'docs/checks');
fs.mkdirSync(screenshotDir, {recursive: true});
fs.mkdirSync(evidenceDir, {recursive: true});

(async () => {
  const browser = await chromium.launch({headless: true, executablePath: chrome});
  const results = {testedAt: new Date().toISOString(), origin, pages: [], flows: [], errors: []};
  const page = await browser.newPage();
  let issues = [];
  page.on('pageerror', e => issues.push(e.message));
  page.on('console', m => { if (m.type() === 'error') issues.push(m.text()); });
  page.on('requestfailed', r => issues.push(`${r.url()}: ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) issues.push(`${r.status()} ${r.url()}`); });
  try {
    for (const [mode, viewport] of [['desktop', {width:1440,height:900}], ['phone', {width:390,height:844}], ['narrow', {width:320,height:740}]]) {
      await page.setViewportSize(viewport);
      for (const name of names) {
        issues = [];
        await page.goto(`${origin}/${name}.html`, {waitUntil:'networkidle'});
        assert.match(await page.title(), /Istanbul Restaurant Astana/);
        assert.equal(await page.locator('main h1').count(), 1);
        const health = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.images].filter(i=>!i.complete || !i.naturalWidth).map(i=>i.src),
          bootstrap: getComputedStyle(document.querySelector('.container')).maxWidth,
          sticky: getComputedStyle(document.querySelector('header')).position
        }));
        assert.equal(health.brokenImages.length, 0, `${name} broken images`);
        assert.ok(health.scrollWidth <= viewport.width + 1, `${name}/${mode} horizontal overflow ${health.scrollWidth}>${viewport.width}`);
        assert.equal(health.sticky, 'sticky');
        if (mode !== 'desktop') {
          await page.locator('#navigation-toggle').click();
          await page.locator('#main-navbar.show').waitFor();
          assert.equal(await page.locator('#main-navbar a.nav-link:visible').count(), 7);
          assert.equal(await page.locator('#main-navbar a[href="colophon.html"]').count(), 0);
          assert.equal(await page.locator('footer a[href="colophon.html"]').count(), 1);
          await page.locator('#navigation-toggle').click();
          await page.locator('#main-navbar').waitFor({state:'hidden'});
        }
        await page.evaluate(async () => {
          await Promise.all([...document.images].map(image => image.decode()));
          scrollTo(0, 0);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        if (mode !== 'narrow') await page.screenshot({path:path.join(screenshotDir, `${name}-${mode}.png`), fullPage:true});
        assert.equal(issues.length, 0, `${name}/${mode}: ${issues.join('; ')}`);
        results.pages.push({name, mode, viewport, ...health, errors:[...issues]});
        console.log(`PASS ${name}/${mode}`);
      }
    }

    await page.setViewportSize({width:390,height:844});
    // Journey 1: actual navigation from Home to the address and opening hours.
    await page.goto(`${origin}/index.html`);
    await page.locator('#navigation-toggle').click();
    await page.locator('#main-navbar a[href="visit.html"]').click();
    await page.locator('a[href="#location-title"]').click();
    assert.match(await page.locator('address').innerText(), /Uly Dala Avenue 56/);
    assert.match(await page.locator('table').innerText(), /08:00–02:00/);
    results.flows.push({name:'find-address-and-hours', result:'pass'});

    const forms = [
      {name:'menu', form:'menu-meal-form', result:'menu-plan-result', select:{'menu-dish':'menemen'}, fill:{'menu-quantity':'2'}},
      {name:'visit', form:'visit-plan-form', result:'visit-form-result', select:{'visit-time':'Lunch'}, fill:{'visit-name':'QA Visitor','visit-email':'visitor@example.com','visit-phone':'+7 700 000 00 00','visit-date':'2026-10-10','visit-guests':'2','visit-note':'A table for two, indoors.'}, check:['visit-dine-in','visit-confirm']},
      {name:'faq', form:'faq-question-form', result:'question-result', select:{'faq-topic':'Menu'}, fill:{'faq-name':'QA Visitor','faq-email':'visitor@example.com','faq-phone':'+7 700 000 00 00','faq-guests':'2','faq-date':'2026-10-10','faq-message':'Does the menemen contain dairy?'}, check:['faq-reply-email','faq-confirm']},
      {name:'feedback', form:'feedback-review-form', result:'feedback-result', select:{'feedback-topic':'Food'}, fill:{'feedback-name':'QA Visitor','feedback-email':'visitor@example.com','feedback-phone':'+7 700 000 00 00','feedback-guests':'2','feedback-date':'2026-10-03','feedback-message':'The breakfast was warm and the service was attentive.'}, check:['feedback-return-yes','feedback-confirm']}
    ];
    async function fillValid(spec) {
      for (const [id, value] of Object.entries(spec.fill)) await page.locator(`#${id}`).fill(value);
      for (const [id, value] of Object.entries(spec.select || {})) await page.locator(`#${id}`).selectOption(value);
      for (const id of spec.check || []) await page.locator(`#${id}`).check();
    }
    async function submitValid(spec) {
      assert.equal(await page.locator(`#${spec.form}`).evaluate(f=>f.checkValidity()), true);
      await Promise.all([page.waitForURL(url=>url.hash === `#${spec.result}`), page.locator(`#${spec.name}-submit`).click()]);
      await page.waitForLoadState('networkidle');
      assert.ok(await page.locator(`#${spec.result} .form-result`).isVisible());
    }
    for (const spec of forms) {
      issues = [];
      await page.goto(`${origin}/${spec.name}.html`);
      const initial = page.url();
      await page.locator(`#${spec.name}-submit`).click();
      assert.equal(page.url(), initial, `${spec.name}: empty form should not navigate`);
      assert.equal(await page.locator(`#${spec.form}`).evaluate(f=>f.checkValidity()), false);
      assert.equal(await page.locator(`#${spec.result} .form-result`).isVisible(), false);
      await fillValid(spec);
      if (spec.name !== 'menu') {
        await page.locator(`#${spec.name === 'feedback' ? 'feedback' : spec.name}-email`).fill('invalid-address');
        assert.equal(await page.locator(`#${spec.form}`).evaluate(f=>f.checkValidity()), false);
        await page.locator(`#${spec.name === 'feedback' ? 'feedback' : spec.name}-email`).fill('visitor@example.com');
      }
      assert.equal(await page.locator(`#${spec.form}`).evaluate(f=>f.checkValidity()), true);
      await Promise.all([page.waitForURL(url=>url.hash === `#${spec.result}`), page.locator(`#${spec.name}-submit`).click()]);
      await page.waitForLoadState('networkidle');
      assert.ok(await page.locator(`#${spec.result} .form-result`).isVisible());
      assert.equal(await page.locator(`#${spec.result} .result-idle`).isVisible(), false);
      await page.locator(`#${spec.result}`).scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(screenshotDir, `${spec.name}-result-phone.png`)});
      await page.locator(`#${spec.result} a`).filter({hasText:'Start again'}).click();
      assert.equal(await page.locator(`#${spec.result} .form-result`).isVisible(), false);
      assert.equal(issues.length, 0, `${spec.name} form: ${issues.join('; ')}`);
      results.flows.push({name:`${spec.name}-validation-result-recovery`, result:'pass'});
      console.log(`PASS ${spec.name} invalid/valid/result/recovery`);
    }
    // Journey 2 follows actual links across both forms without replacing navigation.
    issues = [];
    await page.goto(`${origin}/menu.html`);
    assert.match(await page.locator('#dish-menemen').innerText(), /1,900/);
    assert.match(await page.locator('#dish-gozleme').innerText(), /2,400/);
    await page.locator('section[aria-labelledby="menu-title"] a[href="#meal-planner"]').click();
    await fillValid(forms[0]);
    await submitValid(forms[0]);
    await page.locator('#menu-plan-result a').filter({hasText:'Plan your visit'}).click();
    assert.ok(page.url().endsWith('visit.html#plan-visit'));
    await fillValid(forms[1]);
    await submitValid(forms[1]);
    await page.locator('#visit-form-result a').filter({hasText:'Review address and hours'}).click();
    assert.ok(page.url().endsWith('#location-title'));
    assert.equal(issues.length, 0);
    results.flows.push({name:'compare-meal-and-plan-visit-end-to-end',result:'pass'});
    console.log('PASS journey 2: Menu → meal result → Visit → visit result → address');

    // Journey 3: About -> FAQ answers -> question -> prepared result.
    issues = [];
    await page.goto(`${origin}/about.html`);
    await page.locator('a[href="faq.html#answers-title"]').click();
    assert.ok(page.url().endsWith('faq.html#answers-title'));
    assert.equal(await page.locator('#faq-items article').count(), 6);
    await page.locator('a[href="#question-form"]').filter({hasText:'Prepare a question'}).click();
    await fillValid(forms[2]);
    await submitValid(forms[2]);
    assert.match(await page.locator('#question-result').innerText(), /not been sent or saved/);
    assert.equal(issues.length, 0);
    results.flows.push({name:'about-faq-question-end-to-end',result:'pass'});
    console.log('PASS journey 3: About → FAQ → question → result');
    // Native reset and keyboard entry to the skip link.
    await page.goto(`${origin}/visit.html`);
    await page.locator('#visit-name').fill('Reset me');
    await page.locator('#visit-reset').click();
    assert.equal(await page.locator('#visit-name').inputValue(), '');
    await page.goto(`${origin}/index.html`);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.ok(page.url().endsWith('#main-content'));
    results.flows.push({name:'reset-and-keyboard-skip-link',result:'pass'});
  } catch (error) {
    results.errors.push(error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    results.sourceHashes = Object.fromEntries([...names.map(n=>`${n}.html`),'css/base.css'].map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
    fs.writeFileSync(path.join(evidenceDir,'browser.json'), JSON.stringify(results,null,2)+'\n');
    await browser.close();
  }
})();

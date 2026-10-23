import {chromium} from '../../../.design-tools/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
const out='.design-tools/output/HOME-FINISH',url=process.env.POET_PREVIEW_URL||'http://127.0.0.1:8768/v2/';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
async function run(width){
  const context=await browser.newContext({viewport:{width,height:width>=1280?900:844},isMobile:width<600,hasTouch:width<600,...(width===1440?{recordVideo:{dir:out,size:{width:960,height:600}}}:{})});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>{
    const u=new URL(r.request().url());if(!['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.abort();
    if(u.origin===new URL(url).origin)return r.continue();
    if(u.pathname==='/api/settings')return r.fulfill({json:{donationsEnabled:true},headers:{'Access-Control-Allow-Origin':'*'}});
    return r.abort();
  });
  await p.goto(url);await p.waitForFunction(()=>POETWorld.state==='alive',null,{timeout:15000});
  assert.ok(await p.evaluate(()=>POETWorld.masterTimeline.duration()>=3&&POETWorld.masterTimeline.duration()<=5));
  assert.equal(await p.locator('.low-shrub,[data-obj^="flowers-"],[data-obj^="meadow-"]').count(),0);
  assert.equal(await p.locator('.school-column-top').count(),6);assert.equal(await p.locator('.school-mural').count(),4);
  await p.locator('.tile-piano-toggle').click();await p.waitForFunction(()=>document.querySelector('.tile-piano-toggle').getAttribute('aria-pressed')==='true');await p.waitForTimeout(120);
  await p.evaluate(()=>{window.dragNotes=[];document.addEventListener('poet:tile-note',e=>dragNotes.push({...e.detail,duringDrag:document.querySelector('.hero--world').hasAttribute('data-mascot-dragging')}),true);});
  for(const id of ['daisy-welcome','daisy-explorer','daisy-juice']){
    const c=p.locator(`[data-obj="${id}"]`),rect=await c.locator('image').boundingBox();
    await p.mouse.move(rect.x+rect.width/2,rect.y+rect.height*.55);await p.mouse.down();
    await p.mouse.move(rect.x+rect.width/2-70,rect.y+rect.height*.55+70,{steps:18});await p.mouse.up();
    assert.ok(await c.getAttribute('data-position'));assert.equal(await c.getAttribute('data-dragging'),null);
    const before=await c.getAttribute('data-position');await c.focus();await p.keyboard.press('Enter');await p.keyboard.press('ArrowRight');await p.keyboard.press('Escape');assert.equal(await c.getAttribute('data-position'),before);
    await c.focus();await p.keyboard.press('Space');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');assert.equal(await c.getAttribute('data-dragging'),null);
    const [u,v]=(await c.getAttribute('data-position')).split(' ').map(Number);assert.ok(u>=120&&u<=700&&v>=120&&v<=700);
  }
  assert.equal(await p.evaluate(()=>dragNotes.filter(n=>n.duringDrag).length),0);
  const c=p.locator('[data-obj="daisy-welcome"]'),rect=await c.locator('image').boundingBox();
  await p.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await p.mouse.down();await p.mouse.move(1,1,{steps:25});await p.mouse.up();
  const [u,v]=(await c.getAttribute('data-position')).split(' ').map(Number);assert.ok(u>=120&&v>=120&&u<=700&&v<=700);
  await c.focus();await p.keyboard.press('Enter');await p.evaluate(()=>dispatchEvent(new Event('blur')));assert.equal(await c.getAttribute('data-dragging'),null);
  const saved=await c.getAttribute('data-position');await p.setViewportSize({width:width-10,height:844});await p.waitForTimeout(100);assert.equal(await c.getAttribute('data-position'),saved);
  await p.setViewportSize({width,height:width>=1280?900:844});
  await p.locator('.tile-piano-toggle').click();assert.equal(await p.evaluate(()=>localStorage.getItem('poet:playground:sound')),'off');
  if(width===1440||width===390)await p.screenshot({path:`${out}/${width}-hero.png`});
  await p.locator('#presse').scrollIntoViewIfNeeded();const trigger=p.locator('.site-dropdown>button');
  if(width<600)await p.locator('.site-nav-toggle').click();
  await trigger.focus();await p.keyboard.press('Enter');assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  assert.equal(await trigger.getAttribute('aria-label'),'Đồng hành cùng POET');
  assert.ok(await trigger.locator('img').evaluate(i=>i.naturalWidth===144));
  await p.keyboard.press('Escape');assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  assert.equal(await p.locator('.home-affiliation-logo img').getAttribute('alt'),'VNV — Cộng đồng Tình nguyện Việt Nam');
  assert.ok(await trigger.locator('.partner-nav-name').isVisible());
  assert.equal(await p.locator('.home-press-logos a').count(),2);assert.equal(await p.locator('.archive-section--home .inline-metrics strong').count(),5);
  assert.deepEqual(await p.locator('.archive-section--home .inline-metrics strong').allTextContents(),['120','5','30','10','5']);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===1440||width===390){await p.locator('#dau-an').scrollIntoViewIfNeeded();await p.waitForTimeout(900);await p.screenshot({path:`${out}/${width}-home.png`,fullPage:true});}
  await p.reload();await p.waitForTimeout(800);assert.equal(await p.locator('.tile-piano-toggle').getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);results.push({width,passed:true});console.log('PASS Home finish',width);
  const video=p.video();await context.close();if(video)await video.saveAs(`${out}/mascot-drag.webm`);
}
try{for(const width of [1440,1280,390,360])await run(width);fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));}finally{await browser.close();}

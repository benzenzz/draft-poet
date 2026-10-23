// Regression: plain local previews must retain caption motion and the 1.5s loop
// even in webviews reporting reduced motion. Explicit/public reduction stays on.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '../../../.design-tools/node_modules/playwright/index.mjs';
const out='.design-tools/output/activity-motion';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
async function run(width,{respect=false,publicHost=false}={}){
  const context=await browser.newContext({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{
    const req=route.request(),u=new URL(req.url());
    if(!['GET','HEAD','OPTIONS'].includes(req.method()))return route.abort();
    if(u.hostname==='poet-review.test')return route.continue({url:req.url().replace('http://poet-review.test','http://127.0.0.1:8766')});
    if(u.hostname==='127.0.0.1')return route.continue();
    if(u.pathname==='/api/settings')return route.fulfill({json:{donationsEnabled:true},headers:{'Access-Control-Allow-Origin':'*'}});
    return route.abort();
  });
  await page.addInitScript(()=>{
    window.activityQA={effects:[],holds:[]};
    const animate=Element.prototype.animate,set=window.setTimeout;
    Element.prototype.animate=function(frames,options){
      if(this.matches('.activity-text-line'))activityQA.effects.push({delay:options.delay,duration:options.duration});
      return animate.call(this,frames,options);
    };
    window.setTimeout=function(fn,delay,...args){if(delay===1500)activityQA.holds.push(delay);return set(fn,delay,...args);};
  });
  const host=publicHost?'http://poet-review.test':'http://127.0.0.1:8766';
  await page.goto(host+'/v2/'+(respect?'?homeMotion=respect':'')+'#hoat-dong');
  await page.mouse.move(2,2);
  await page.waitForSelector('[data-activity-carousel][data-motion-ready]');
  const active=()=>page.locator('.activity-slide.is-active').getAttribute('id');
  if(respect||publicHost){
    await page.waitForTimeout(3500);
    assert.equal(await active(),'activity-slide-1');
    assert.equal(await page.evaluate(()=>activityQA.effects.length),0);
  }else{
    for(const id of ['activity-slide-2','activity-slide-3','activity-slide-4','activity-slide-1']){
      await page.waitForFunction(id=>document.querySelector('.activity-slide.is-active')?.id===id,id,{timeout:8000});
    }
    const qa=await page.evaluate(()=>activityQA);
    assert.ok(qa.effects.some(e=>e.duration===500));
    assert.ok(new Set(qa.effects.map(e=>e.delay)).size>=3,'Caption lines enter sequentially');
    assert.ok(qa.holds.length>=4,'Each transition is followed by a 1500ms hold');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:`${out}/${width}.png`});
  }
  assert.deepEqual(errors,[]);
  results.push({width,respect,publicHost,passed:true});
  console.log('PASS',JSON.stringify(results.at(-1)));
  await context.close();
}
try{
  await Promise.all([run(1440),run(390),run(1440,{respect:true}),run(1440,{publicHost:true})]);
  fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
}finally{await browser.close();}

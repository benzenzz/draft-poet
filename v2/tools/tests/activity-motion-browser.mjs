// Regression (fb-28): the Home activity carousel keeps its 1.5s loop and photo crossfade
// on every device (motion/always-motion.js), but slide text is static: nothing inside
// .activity-copy is ever animated. ?heroMotion=respect restores the OS reduced-motion
// setting, which stops autoplay.
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
    window.activityQA={copy:[],images:[],holds:[]};
    const animate=Element.prototype.animate,set=window.setTimeout;
    Element.prototype.animate=function(frames,options){
      if(this.closest('.activity-copy'))activityQA.copy.push(this.className||this.tagName);
      if(this.matches('.activity-cover'))activityQA.images.push(options.duration);
      return animate.call(this,frames,options);
    };
    window.setTimeout=function(fn,delay,...args){if(delay===1500)activityQA.holds.push(delay);return set(fn,delay,...args);};
  });
  const host=publicHost?'http://poet-review.test':'http://127.0.0.1:8766';
  await page.goto(host+'/v2/'+(respect?'?heroMotion=respect':'')+'#hoat-dong');
  await page.mouse.move(2,2);
  await page.waitForSelector('[data-activity-carousel][data-motion-ready]');
  const active=()=>page.locator('.activity-slide.is-active').getAttribute('id');
  if(respect){
    await page.waitForTimeout(3500);
    assert.equal(await active(),'activity-slide-1');
  }else{
    for(const id of ['activity-slide-2','activity-slide-3','activity-slide-4','activity-slide-1']){
      await page.waitForFunction(id=>document.querySelector('.activity-slide.is-active')?.id===id,id,{timeout:8000});
    }
    const qa=await page.evaluate(()=>activityQA);
    assert.ok(qa.images.some(d=>d===600),'Photos still crossfade over 600ms');
    assert.ok(qa.holds.length>=4,'Each transition is followed by a 1500ms hold');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:`${out}/${width}${publicHost?'-public':''}.png`});
  }
  assert.deepEqual(await page.evaluate(()=>activityQA.copy),[],'Slide text is never animated');
  // Only the active slide's text is visible, and it is fully opaque in place.
  const text=await page.evaluate(()=>[...document.querySelectorAll('.activity-copy')].filter(c=>getComputedStyle(c).visibility==='visible').map(c=>getComputedStyle(c).opacity));
  assert.deepEqual(text,['1']);
  assert.deepEqual(errors,[]);
  results.push({width,respect,publicHost,passed:true});
  console.log('PASS',JSON.stringify(results.at(-1)));
  await context.close();
}
try{
  await Promise.all([run(1440),run(390),run(1440,{respect:true}),run(1440,{publicHost:true})]);
  fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
}finally{await browser.close();}

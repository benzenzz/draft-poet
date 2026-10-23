import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '../../../.design-tools/node_modules/playwright/index.mjs';
const url=process.env.POET_PREVIEW_URL||'http://127.0.0.1:8768/v2/';
const out='.design-tools/output/HERO-RISE';fs.mkdirSync(out,{recursive:true});
const results=[],browser=await chromium.launch({channel:'msedge',headless:true});
async function run(width,reduced=false){
  const context=await browser.newContext({viewport:{width,height:width>=1280?900:844},isMobile:width<600,hasTouch:width<600,reducedMotion:reduced?'reduce':'no-preference',...(width===1440&&!reduced?{recordVideo:{dir:out,size:{width:960,height:600}}}:{})});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{
    const req=route.request(),u=new URL(req.url());
    if(!['GET','HEAD','OPTIONS'].includes(req.method()))return route.abort();
    if(u.origin===new URL(url).origin)return route.continue();
    if(u.pathname==='/api/settings')return route.fulfill({json:{donationsEnabled:true},headers:{'Access-Control-Allow-Origin':'*'}});
    return route.abort();
  });
  await page.addInitScript(()=>{
    window.riseQA={settled:[],legacy:0,notes:[],intro:0,ready:0};
    new MutationObserver(()=>{if(!riseQA.intro&&document.documentElement.dataset.worldState==='intro')riseQA.intro=performance.now();}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-world-state']});
    document.addEventListener('poet:hero-ready',()=>riseQA.ready=performance.now(),true);
    document.addEventListener('poet:tile-land',()=>riseQA.legacy++,true);
    document.addEventListener('poet:tile-settled',e=>riseQA.settled.push({tile:e.detail.tile.dataset.obj,time:POETWorld.masterTimeline.time(),y:Number(gsap.getProperty(e.detail.tile,'y'))}),true);
    document.addEventListener('poet:tile-note',e=>riseQA.notes.push(e.detail),true);
  });
  await page.goto(url+(reduced?'?heroMotion=respect':''));
  await page.waitForFunction(()=>window.POETWorld?.state==='intro');
  if(!reduced){await page.locator('.tile-piano-toggle').click();}
  await page.waitForFunction(()=>['alive','reduced'].includes(POETWorld.state),null,{timeout:12000});
  const data=await page.evaluate(()=>({
    qa:riseQA,duration:POETWorld.masterTimeline.duration(),entries:POETWorld.entries,
    logo:document.querySelectorAll('.intro-logo,[data-intro-logo],[data-obj="little-house"]').length,
    poems:[...document.querySelectorAll('.intro-poem')].map(p=>({text:p.getAttribute('aria-label'),font:getComputedStyle(p).fontFamily,style:getComputedStyle(p).fontStyle,weight:getComputedStyle(p).fontWeight,width:p.getBoundingClientRect().width,center:p.getBoundingClientRect().x+p.getBoundingClientRect().width/2})),
    stalls:[...document.querySelectorAll('.stall')].map(el=>({ground:el.dataset.ground,normal:el.querySelector('.booth-layout').dataset.frontNormal,sign:el.querySelector('text').textContent})),
    school:document.querySelector('[data-obj="school"]').dataset.ground,meadows:document.querySelectorAll('[data-obj^="meadow-"]').length,
    shrubs:document.querySelectorAll('.low-shrub').length,
    lineStarts:POETWorld.masterTimeline.getChildren(true,true,false).filter(t=>t.targets().some(e=>e.matches?.('.intro-poem'))&&t.vars.opacity===1&&t.vars.stagger===.24).flatMap(t=>t.timeline.getChildren().map(c=>c.startTime())),
    board:getComputedStyle(document.querySelector('.board-top')).fill,overflow:document.documentElement.scrollWidth>innerWidth,
    tabStops:document.querySelectorAll('.tile[tabindex="0"]').length,
    controls:document.querySelectorAll('.tile-piano-toggle').length,
    links:[...document.querySelectorAll('.hero--world a[href]')].map(a=>a.getAttribute('href'))
  }));
  assert.equal(data.logo,0);assert.equal(data.meadows,0);assert.equal(data.school,'58 278');assert.equal(data.stalls.length,3);
  assert.ok(data.stalls.every(s=>s.ground.endsWith(' 58')&&s.normal==='0 1'));
  assert.deepEqual(data.stalls.map(s=>s.ground),['278 58','480.4 58','682.8 58']);
  assert.ok(data.stalls[0].sign.includes('Community')&&data.stalls[1].sign==='Big Joy Little Joy'&&data.stalls[2].sign==='Young Joy Collection');
  assert.equal(data.shrubs,0);
  assert.deepEqual(data.poems.map(p=>p.text),['hành trình niềm vui bắt đầu','đan tay cùng bước, có nhau là nhà']);
  assert.ok(data.poems.every(p=>p.style==='italic'&&p.weight==='400'&&p.font.includes('Product Sans')&&p.width<=width&&Math.abs(p.center-width/2)<2));
  assert.equal(data.overflow,false);assert.equal(data.board,'rgb(245, 230, 204)');assert.equal(data.tabStops,1);assert.equal(data.controls,1);
  assert.deepEqual(data.links,['#hoat-dong']);assert.equal(data.qa.legacy,0);
  if(reduced){assert.equal(data.qa.settled.length,0);assert.equal(data.qa.notes.length,0);assert.equal(await page.evaluate(()=>POETWorld.ambientTimelines.length),0);}
  else{
    assert.equal(data.lineStarts.length,2);assert.ok(Math.abs(data.lineStarts[1]-data.lineStarts[0]-.24)<.001);
    assert.ok(data.duration>=3&&data.duration<=5);assert.ok((data.qa.ready-data.qa.intro)/1000>=3&&(data.qa.ready-data.qa.intro)/1000<=5);
    const tiles=data.entries.filter(e=>e.kind==='tile'),ends=new Map(tiles.map(t=>[t.name,t.end]));
    assert.ok(Math.abs(Math.max(...tiles.map(t=>t.end))-Math.min(...tiles.map(t=>t.start))-.85)<.001);
    assert.ok(data.entries.filter(e=>e.kind==='equipment').some(e=>e.start<Math.max(...tiles.map(t=>t.end))));
    for(const e of data.entries.filter(e=>e.supports?.length))assert.ok(e.supports.every(id=>e.start>=ends.get(id)+.059));
    assert.equal(data.qa.settled.length,32);assert.equal(new Set(data.qa.settled.map(e=>e.tile)).size,32);
    // GSAP dispatches callbacks on its next rendered tick; recording/load can
    // skip frames. Assert actual final geometry and that no note fires early.
    assert.ok(data.qa.settled.every(e=>Math.abs(e.y)<.01&&e.time>=ends.get(e.tile)-.001));
    assert.equal(data.qa.notes.filter(n=>n.source==='assembly').length,32);
    const tile=page.locator('.tile[tabindex="0"]');await tile.focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>riseQA.notes.at(-1).source),'keyboard');
    if(width===1440){
      await page.evaluate(()=>{riseQA.notes=[];riseQA.settled=[];POETWorld.replay();});
      await page.waitForFunction(()=>POETWorld.state==='alive',null,{timeout:10000});
      assert.equal(await page.evaluate(()=>riseQA.notes.filter(n=>n.source==='assembly').length),32);
      assert.equal(await page.locator('.tile-piano-toggle').count(),1);
      await page.evaluate(()=>{riseQA.notes=[];riseQA.settled=[];POETWorld.replay();});
      await page.waitForFunction(()=>POETWorld.state==='intro');await page.evaluate(()=>POETWorld.finish());
      assert.equal(await page.evaluate(()=>riseQA.notes.length),0);
      assert.equal(await page.evaluate(()=>document.querySelector('.join-joy-link').getAttribute('aria-disabled')),null);
    }
  }
  if(width===1440||width===390)await page.screenshot({path:`${out}/${reduced?'reduced':width===1440?'desktop':'mobile'}.png`});
  assert.deepEqual(errors,[]);
  results.push({width,reduced,elapsed:(data.qa.ready-data.qa.intro)/1000,master:data.duration,settled:data.qa.settled.length,passed:true});
  console.log('PASS',JSON.stringify(results.at(-1)));
  const video=page.video();await context.close();if(video)await video.saveAs(`${out}/transition.webm`);
}
try{
  for(const width of [1440,1280,390,360])await run(width);
  await run(390,true);
  fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
}finally{await browser.close();}

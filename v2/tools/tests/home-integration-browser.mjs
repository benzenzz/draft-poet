// Natural input only: never seek/replay/finish an animation timeline in this QA.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {chromium} from '../../../.design-tools/node_modules/playwright/index.mjs';
const out=path.resolve('.design-tools/output/home-integration/natural');fs.mkdirSync(out,{recursive:true});
const url='http://127.0.0.1:8766/v2/',report={startedAt:new Date().toISOString(),checks:[],flows:[],screenshots:[],errors:[],consoleErrors:[],localHTTPFailures:[],settingsFixtures:0,writeAttempts:0};
const check=(name,ok)=>{report.checks.push({name,passed:!!ok});assert(ok,name);console.log('PASS '+name);};
const browser=await chromium.launch({channel:'msedge',headless:true});
async function contextFor(width,reducedMotion='no-preference'){
 const context=await browser.newContext({viewport:{width,height:width===1440?900:844},reducedMotion,isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 await context.route('**/*',route=>{const req=route.request(),u=new URL(req.url());if(!['GET','HEAD','OPTIONS'].includes(req.method())){report.writeAttempts++;return route.abort();}if(!['127.0.0.1','localhost'].includes(u.hostname)){if(u.pathname==='/api/settings'){report.settingsFixtures++;return route.fulfill({json:{donationsEnabled:true},headers:{'access-control-allow-origin':'*'}});}return route.abort();}return route.continue();});
 return context;
}
async function shot(page,name){await page.screenshot({path:path.join(out,name+'.png'),scale:'css'});report.screenshots.push({file:name+'.png',viewport:page.viewportSize(),naturalFrame:true});}
try{
 for(const width of [1440,390]){
  const context=await contextFor(width),page=await context.newPage(),flow={width,events:[]};report.flows.push(flow);
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});page.on('response',res=>{if(res.url().startsWith('http://127.0.0.1:8766/')&&res.status()>=400)report.localHTTPFailures.push({url:res.url(),status:res.status()});});
  await page.addInitScript(()=>{window.homeReviewHandoffs=[];document.addEventListener('poet:hero-handoff',e=>window.homeReviewHandoffs.push({at:performance.now(),...e.detail}));});
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.POETWorld?.state==='intro',null,{timeout:15000});await page.waitForTimeout(2550);
  flow.intro=await page.evaluate(()=>({state:window.POETWorld.state,font:getComputedStyle(document.querySelector('.intro-poem')).fontFamily,loaded:document.fonts.check('700 24px "Suaserif"'),poems:[...document.querySelectorAll('.intro-poem')].map(e=>({text:e.textContent,font:getComputedStyle(e).font,opacity:getComputedStyle(e).opacity})),phaseEvents:window.POETWorld.phaseEvents}));
  check(width+' natural Intro appears with loaded Suaserif in greeting scope',flow.intro.state==='intro'&&flow.intro.font.includes('Suaserif')&&flow.intro.loaded);
  await shot(page,width+'-intro');
  await page.waitForFunction(()=>window.POETWorld?.state==='alive',null,{timeout:20000});await page.waitForTimeout(250);
  flow.hero=await page.evaluate(()=>({state:window.POETWorld.state,phases:window.POETWorld.phaseEvents,tiles:document.querySelectorAll('.hero--world .tile').length,font:getComputedStyle(document.querySelector('.join-joy-lettering')).fontFamily,headerFont:getComputedStyle(document.querySelector('.site-brand-letters')).fontFamily,pauseButtons:document.querySelectorAll('.world-motion-toggle').length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,masterDuration:window.POETWorld.masterTimeline?.duration()}));
  check(width+' natural Intro → board assembly → alive completes',flow.hero.phases.some(e=>e.name==='intro')&&flow.hero.phases.some(e=>e.name==='tiles')&&flow.hero.state==='alive'&&flow.hero.tiles===32);
  check(width+' scoped board font and Product Sans header coexist',flow.hero.font.includes('Suaserif')&&flow.hero.headerFont.includes('Product Sans')&&flow.hero.pauseButtons===0);
  check(width+' Hero does not cause horizontal page overflow',flow.hero.scrollWidth===width);
  await shot(page,width+'-hero');
  if(width===1440){
   const point=await page.evaluate(()=>{for(const id of ['tile-5','tile-12','tile-18','tile-26']){const e=document.querySelector('[data-obj="'+id+'"] .tile-inset');if(!e)continue;const b=e.getBBox(),p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(e.getScreenCTM());if(document.elementFromPoint(p.x,p.y)?.closest('.tile')?.dataset.obj===id)return {x:p.x,y:p.y,id,before:getComputedStyle(e).fill};}return null;});
   check('A visible board tile has a real pointer hit target',!!point);await page.mouse.move(point.x,point.y);await page.waitForTimeout(300);
   flow.hover={...point,on:await page.locator('[data-obj="'+point.id+'"] .tile-inset').evaluate(e=>getComputedStyle(e).fill)};
   check('Board hover changes only the hovered tile to a brand color',flow.hover.on!==point.before&&await page.locator('.hero--world .tile:hover').count()===1);
   await shot(page,'1440-board-hover');await page.mouse.move(5,5);await page.waitForTimeout(300);flow.hover.after=await page.locator('[data-obj="'+point.id+'"] .tile-inset').evaluate(e=>getComputedStyle(e).fill);check('Board tile restores after pointer leaves',flow.hover.after===point.before);
  }
  const click=await page.locator('.join-joy-face').evaluate(e=>{const b=e.getBBox(),p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(e.getScreenCTM());return {x:p.x,y:p.y,hit:!!document.elementFromPoint(p.x,p.y)?.closest('.join-joy-link')};});check(width+' Have fun face has correct board click target',click.hit);
  if(width===390)await page.touchscreen.tap(click.x,click.y);else await page.mouse.click(click.x,click.y);
  await page.waitForFunction(()=>location.hash==='#hoat-dong'&&!document.querySelector('.hero-join-wave'),null,{timeout:7000});
  flow.handoff=await page.evaluate(()=>({events:window.homeReviewHandoffs,hash:location.hash,transition:document.documentElement.dataset.heroTransition||null,waves:document.querySelectorAll('.hero-join-wave').length,carouselReady:document.querySelector('[data-activity-carousel]').dataset.motionReady}));
  check(width+' board click/tap completes wave handoff into Codex carousel',flow.handoff.events.some(e=>e.phase==='start')&&flow.handoff.events.some(e=>e.phase==='complete')&&flow.handoff.waves===0&&flow.handoff.carouselReady==='true');
  await page.locator('.site-wordmark').focus();if(width===1440)await page.mouse.move(5,5);
  flow.autoplay=await page.evaluate(async()=>{const seen=new Set(),end=performance.now()+4200;while(performance.now()<end){seen.add(document.querySelector('[data-slide][aria-current=true]')?.dataset.slide);await new Promise(r=>setTimeout(r,100));}return [...seen];});check(width+' carousel autoplay survives Hero handoff',flow.autoplay.length>1);
  await shot(page,width+'-activity');
  await page.locator('[data-slide="3"]').click();await page.waitForTimeout(1700);check(width+' carousel dots work and persistent CTA matches active slide',await page.evaluate(()=>document.querySelector('[data-slide="3"]').getAttribute('aria-current')==='true'&&document.querySelector('.activity-static-cta').href===document.querySelectorAll('.activity-copy .btn')[3].href));
  await page.locator('[data-activity-prev]').click();await page.waitForTimeout(1700);check(width+' carousel previous works after manual selection',await page.locator('[data-slide="2"]').getAttribute('aria-current')==='true');
  await page.locator('.credibility').scrollIntoViewIfNeeded();await page.waitForTimeout(500);const stripBefore=await page.locator('.press-logo-track').evaluate(e=>getComputedStyle(e).transform);await page.mouse.wheel(0,160);await page.waitForTimeout(600);const stripAfter=await page.locator('.press-logo-track').evaluate(e=>getComputedStyle(e).transform);flow.strip={before:stripBefore,after:stripAfter};check(width+' existing press strip still responds to vertical scroll',stripBefore!==stripAfter);
  for(const card of await page.locator('.story-card').all()){await card.scrollIntoViewIfNeeded();await page.waitForTimeout(1200);}
  flow.archive=await page.locator('.story-card').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,imageHeight:e.querySelector('img').getBoundingClientRect().height,opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform,title:getComputedStyle(e.querySelector('h3 a')).color,ctaInside:e.querySelector('.text-link').getBoundingClientRect().bottom<=e.getBoundingClientRect().bottom})));
  check(width+' Claude archive cards remain present/revealed',flow.archive.length===2&&flow.archive.every(e=>+e.opacity===1));
  check(width+' archive CTA content is not clipped',flow.archive.every(e=>e.ctaInside));
  if(width===1440){await page.locator('#dau-an').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top,behavior:'instant'}));await shot(page,'1440-archive');}
  else{for(let i=0;i<2;i++){await page.locator('.story-card').nth(i).evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-100,behavior:'instant'}));await shot(page,'390-archive-card-'+(i+1));}}
  await page.locator('#truyen-thong').scrollIntoViewIfNeeded();await page.waitForTimeout(750);
  flow.media=await page.locator('.press-grid .media-card').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,href:e.querySelector('h3 a').href,anchors:e.querySelectorAll('a').length,covers:e.querySelectorAll('img').length})));
  check(width+' Claude media grid replaces obsolete rail with three linked text cards',flow.media.length===3&&flow.media.every(e=>e.anchors===1&&e.covers===0)&&await page.locator('[data-carousel],.rail-controls').count()===0);
  check(width+' media grid is responsive',width===1440?flow.media.every(e=>Math.abs(e.y-flow.media[0].y)<1):flow.media[1].y>flow.media[0].y);
  await page.locator('#truyen-thong').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-100,behavior:'instant'}));await shot(page,width+'-media');
  if(width===1440){await page.locator('.press-grid .media-card').first().hover();await page.waitForTimeout(220);flow.mediaHover=await page.locator('.press-grid .media-card h3 a').first().evaluate(e=>getComputedStyle(e).color);check('Claude stretched media card hover remains approved green',flow.mediaHover==='rgb(57, 159, 120)');await shot(page,'1440-media-hover');}
  await page.locator('[data-fund-animate]').scrollIntoViewIfNeeded();await page.waitForTimeout(900);await page.locator('[data-fund-animate] [data-donate]').click();
  check(width+' Donate opens existing local dialog without submitting',await page.locator('dialog[open]').count()===1);await page.keyboard.press('Escape');check(width+' Escape closes donation dialog',await page.locator('dialog[open]').count()===0);
  await page.goto(url+'?heroMotion=respect&carouselMotion=respect&pressMotion=respect',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1300);
  // Observe the actual stagger from a fresh page. No seek, forced classes or synthetic transition events.
  flow.reveal=await page.evaluate(async()=>{const cards=[...document.querySelectorAll('.archive-grid .story-card')],samples=[],start=performance.now();scrollTo({top:scrollY+cards[0].getBoundingClientRect().top-105,behavior:'instant'});await new Promise(resolve=>{function frame(t){samples.push({time:t-start,cards:cards.map(e=>({opacity:+getComputedStyle(e).opacity,transform:getComputedStyle(e).transform,revealed:e.classList.contains('is-revealed')}))});if(t-start<1400)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});return samples;});
  check(width+' archive reveal reaches readable final state',flow.reveal.at(-1).cards[0].opacity===1);
  if(width===1440){const a=flow.reveal.find(s=>s.cards[0].opacity>0)?.time,b=flow.reveal.find(s=>s.cards[1].opacity>0)?.time;flow.stagger={first:a,second:b};check('Desktop archive retains the second-card stagger',b-a>=350&&b-a<=650);}
  check(width+' no horizontal overflow after full interaction flow',await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
  await context.close();
 }
 const reduced=await contextFor(390,'reduce'),page=await reduced.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
 await page.goto(url+'?heroMotion=respect&carouselMotion=respect&pressMotion=respect',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.POETWorld?.state==='reduced',null,{timeout:10000});
 report.reduced=await page.evaluate(()=>({state:window.POETWorld.state,phases:window.POETWorld.phaseEvents,worldMotion:document.documentElement.dataset.worldMotion,archiveRevealClass:document.documentElement.classList.contains('reveal-motion'),hoverAnim:document.querySelectorAll('.world-motion-toggle').length}));
 check('Explicit respect mode honors reduced motion without board assembly',report.reduced.state==='reduced'&&report.reduced.worldMotion==='paused'&&!report.reduced.phases.some(e=>e.name==='tiles')&&!report.reduced.archiveRevealClass);
 await page.locator('#dau-an').scrollIntoViewIfNeeded();check('Reduced-motion archive is readable immediately',await page.locator('.story-card').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1'&&!e.classList.contains('will-reveal'))));
 await page.locator('#hoat-dong').scrollIntoViewIfNeeded();const before=await page.locator('[data-slide][aria-current=true]').getAttribute('data-slide');await page.waitForTimeout(2300);check('Reduced-motion carousel remains stable',before===await page.locator('[data-slide][aria-current=true]').getAttribute('data-slide'));
 await page.locator('[data-slide="2"]').click();await page.waitForFunction(()=>document.querySelector('[data-slide="2"]').getAttribute('aria-current')==='true',null,{timeout:5000});check('Reduced-motion carousel manual navigation works',await page.locator('[data-slide="2"]').getAttribute('aria-current')==='true');
 await reduced.close();check('No new JavaScript/console errors / missing local assets / real submissions',report.errors.length===0&&report.consoleErrors.length===0&&report.localHTTPFailures.length===0&&report.writeAttempts===0);report.status='passed';
}catch(e){report.status='failed';report.error=e.stack;process.exitCode=1;console.error(e.stack);}finally{fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}

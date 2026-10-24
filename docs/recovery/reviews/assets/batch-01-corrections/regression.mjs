// Run from repository root. Uses the existing local Playwright MCP/Edge configuration.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import readline from 'node:readline';
import {spawn,execFileSync} from 'node:child_process';
const phase=process.argv[2];assert(['before','after'].includes(phase));
if(phase==='before'){
  assert(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim()==='e0a993839c83ef5273c4b518b833d856263241a6');
  execFileSync('git',['diff','--quiet','--','v2/site.js','v2/tools/site-templates.mjs'],{windowsHide:true});
}
const output=path.resolve('docs/recovery/reviews/assets/batch-01-corrections');
const report={phase,startedAt:new Date().toISOString(),checks:[],viewports:[],screenshots:[]};
const config=fs.readFileSync('.codex/config.toml','utf8');
const command=config.match(/^command = '([^']+)'/m)[1];
const args=[...config.match(/^args = \[(.+)\]/m)[1].matchAll(/'([^']*)'/g)].map(m=>m[1]);
const child=spawn(command,args,{cwd:process.cwd(),windowsHide:true,stdio:['pipe','pipe','pipe']});
const pending=new Map();let id=0,stderr='';
child.stderr.on('data',b=>stderr=(stderr+b).slice(-3000));
readline.createInterface({input:child.stdout}).on('line',line=>{
  let m;try{m=JSON.parse(line);}catch{return;}
  if(m.id!==undefined&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}
});
child.on('error',e=>{for(const p of pending.values())p.reject(e);});
const request=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id,timer=setTimeout(()=>{pending.delete(requestId);reject(new Error('MCP timeout '+method));},55000);pending.set(requestId,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:requestId,method,params})+'\n');});
async function call(name,args={}){const r=await request('tools/call',{name,arguments:args});const t=r.content?.filter(c=>c.type==='text').map(c=>c.text).join('\n')||'';if(r.isError)throw new Error(name+': '+t);return t;}
async function evaluate(fn){const t=await call('browser_evaluate',{function:typeof fn==='function'?fn.toString():fn});const start=t.indexOf('### Result\n')+11,end=t.indexOf('\n###',start);return JSON.parse(t.slice(start,end<0?undefined:end));}
const check=(name,value)=>{report.checks.push({name,passed:!!value});assert(value,name);console.log('PASS '+name);};
const wait=()=>evaluate(async()=>{await new Promise(r=>setTimeout(r,350));return true;});
async function capture(name,target){const file=phase+'-'+name+'.png';await call('browser_take_screenshot',{filename:path.join(output,file),type:'png',scale:'css',target,element:name});report.screenshots.push(file);}
async function state(){return evaluate(()=>{
  const rail=document.querySelector('.press-rail'),wrap=rail.closest('[data-carousel]'),box=rail.getBoundingClientRect();
  return {clientWidth:rail.clientWidth,scrollWidth:rail.scrollWidth,scrollLeft:rail.scrollLeft,max:rail.scrollWidth-rail.clientWidth,
    cards:[...rail.children].map(e=>({width:e.getBoundingClientRect().width,start:e.getBoundingClientRect().left-box.left+rail.scrollLeft})),
    indicator:wrap.querySelector('.rail-count').textContent,live:wrap.querySelector('.rail-count').getAttribute('aria-live'),atomic:wrap.querySelector('.rail-count').getAttribute('aria-atomic'),
    prevDisabled:wrap.querySelector('[data-prev]').disabled,nextDisabled:wrap.querySelector('[data-next]').disabled};
});}
async function key(key){await evaluate(()=>{document.querySelector('.press-rail').focus({preventScroll:true});return true;});await call('browser_press_key',{key});await wait();return state();}
function positions(s){const max=s.max;return [...s.cards.map(c=>Math.min(max,Math.max(0,c.start))),max].sort((a,b)=>a-b).filter((p,i,a)=>!i||p-a[i-1]>1);}
function verify(s,name){
  const points=positions(s),nearest=points.reduce((best,p,i)=>Math.abs(p-s.scrollLeft)<Math.abs(points[best]-s.scrollLeft)?i:best,0);
  check(name+' reachable-position label',s.indicator===`Vị trí ${nearest+1} / ${points.length}`);
  check(name+' boundary controls',s.prevDisabled===(s.scrollLeft<=points[0]+1)&&s.nextDisabled===(s.scrollLeft>=s.max-1));
  check(name+' polite atomic live region',s.live==='polite'&&s.atomic==='true');
}
try{
  report.server=(await request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'poet-batch1-corrections',version:'1.0.0'}})).serverInfo;
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
  await call('browser_emulate_media',{reducedMotion:'reduce'});
  for(const [width,height] of [[1440,900],[768,1024],[390,844],[320,740]]){
    await call('browser_resize',{width,height});
    await call('browser_navigate',{url:'http://127.0.0.1:8766/v2/team/?review='+phase});
    await evaluate(async()=>{await document.fonts.ready;document.querySelector('.press-section').scrollIntoView({behavior:'instant'});await new Promise(r=>setTimeout(r,200));return true;});
    const v={width,height,states:[]};report.viewports.push(v);
    const start=await key('Home');v.states.push({action:'Home',...start});
    if(phase==='after')verify(start,width+' Home');
    await capture(width+'-press-start','.press-section');
    let previous=start;
    for(let i=0;i<5&&!previous.nextDisabled;i++){
      await call('browser_click',{target:'.press-section [data-next]',element:'Next press position'});await wait();
      const s=await state();v.states.push({action:'Next',...s});
      if(phase==='after'){verify(s,width+' Next '+i);check(width+' Next advances',s.scrollLeft>previous.scrollLeft+1);check(width+' lands on reachable point',positions(s).some(p=>Math.abs(p-s.scrollLeft)<=1));}
      previous=s;
    }
    if(width===1440)await capture(width+'-press-end','.press-section');
    const end=await key('End');v.states.push({action:'End',...end});
    if(phase==='after'){verify(end,width+' End');check(width+' End at max',Math.abs(end.scrollLeft-end.max)<=1);}
    const back=await key('ArrowLeft');v.states.push({action:'ArrowLeft',...back});
    if(phase==='after'){verify(back,width+' ArrowLeft');check(width+' ArrowLeft retreats',back.scrollLeft<end.scrollLeft-1);}
    const home=await key('Home');v.states.push({action:'Home again',...home});
    if(phase==='after'){verify(home,width+' Home again');check(width+' Home at first snap',Math.abs(home.scrollLeft-positions(home)[0])<=1);}
    const right=await key('ArrowRight');v.states.push({action:'ArrowRight',...right});
    if(phase==='after')verify(right,width+' ArrowRight');
    await evaluate(()=>{document.querySelector('.join-section').scrollIntoView({behavior:'instant'});return true;});await wait();
    v.heading=await evaluate(()=>{
      const card=document.querySelector('.participation-grid .action-card:nth-child(2)'),h=card.querySelector('h3'),r=h.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(h);
      const lines=[...range.getClientRects()].map(r=>({x:r.x,y:r.y,width:r.width,height:r.height}));
      return {text:h.textContent,cta:card.querySelector('.action-cta').textContent.trim(),href:card.getAttribute('href'),headingBox:r.toJSON(),cardBox:card.getBoundingClientRect().toJSON(),lines,
        clipped:h.scrollWidth>h.clientWidth+1||(h.scrollHeight>h.clientHeight+1&&['hidden','clip'].includes(getComputedStyle(h).overflowY)),overflow:document.documentElement.scrollWidth>innerWidth,font:getComputedStyle(h).fontFamily};
    });
    if(phase==='after'){
      check(width+' approved business heading',v.heading.text==='Doanh nghiệp đồng hành và tài trợ');
      check(width+' CTA/destination retained',v.heading.cta.startsWith('Đồng hành & tài trợ')&&v.heading.href.endsWith('dong-hanh/#doanh-nghiep'));
      check(width+' heading wraps without clipping or overflow',!v.heading.clipped&&!v.heading.overflow&&v.heading.lines.every(l=>l.x>=v.heading.headingBox.x-1&&l.x+l.width<=v.heading.headingBox.right+1));
      check(width+' Product Sans retained',v.heading.font.includes('Product Sans'));
    }
    await capture(width+'-participation','.participation-panel');
  }
  if(phase==='after'){
    await call('browser_resize',{width:1346,height:900});await wait();
    report.exactReproduction=await key('End');verify(report.exactReproduction,'Reported 1198/1413 geometry');
    check('Reported geometry reproduced',report.exactReproduction.clientWidth===1198&&report.exactReproduction.scrollWidth===1413&&report.exactReproduction.scrollLeft===215&&report.exactReproduction.indicator==='Vị trí 2 / 2'&&report.exactReproduction.nextDisabled);
    // Same live instance, no reload: recalculate points from a narrow end after widening.
    await key('End');
    for(const width of [1440,768,390,320]){
      await call('browser_resize',{width,height:900});await wait();
      const s=await state();report.resize??=[];report.resize.push({width,...s});verify(s,'Live resize '+width);
      const end=await key('End');verify(end,'Resize End '+width);check('Resize End reaches new max '+width,Math.abs(end.scrollLeft-end.max)<=1);
    }
    // Both shared instances use this controller. Home preview respects reduced motion.
    await call('browser_navigate',{url:'http://127.0.0.1:8766/v2/?heroMotion=respect&carouselMotion=respect&pressMotion=respect'});
    await evaluate(async()=>{await document.fonts.ready;document.querySelector('.press-section').scrollIntoView({behavior:'instant'});return true;});await wait();
    report.homeEnd=await key('End');verify(report.homeEnd,'Shared Home End');
    // Isolated no-overflow fixture: remove the other two articles in this browser only.
    // No CSS/geometry changes; the next navigation restores the real three-card content.
    await call('browser_resize',{width:1440,height:900});
    await evaluate(()=>{const rail=document.querySelector('.press-rail');[...rail.children].slice(1).forEach(c=>c.remove());return true;});await wait();
    report.singleCardFixture=await key('Home');verify(report.singleCardFixture,'Single card fixture');check('No overflow has one position',report.singleCardFixture.max===0&&report.singleCardFixture.indicator==='Vị trí 1 / 1');
    // Natural smooth navigation with no forced timeline changes.
    await call('browser_emulate_media',{reducedMotion:'no-preference'});
    await call('browser_resize',{width:390,height:844});await wait();await key('Home');
    await call('browser_navigate',{url:'http://127.0.0.1:8766/v2/team/'});await wait();await key('Home');
    await call('browser_click',{target:'.press-section [data-next]',element:'Smooth next press position'});
    await evaluate(async()=>{await new Promise(r=>setTimeout(r,1000));return true;});
    report.smooth=await state();verify(report.smooth,'Smooth navigation');check('Smooth next advances',report.smooth.scrollLeft>1);
    const errors=await call('browser_console_messages',{level:'error'});report.console=errors;check('No browser console errors',!errors.includes('[ERROR]')&&!errors.includes('[error]'));
  }
  report.status=phase==='before'?'baseline-recorded':'passed';
}catch(e){report.status='failed';report.error=e.message;report.stderr=stderr;process.exitCode=1;console.error(e);}
finally{try{await call('browser_close');}catch{}fs.writeFileSync(path.join(output,phase+'.json'),JSON.stringify(report,null,2)+'\n');child.stdin.end();setTimeout(()=>child.kill(),1500).unref();console.log(JSON.stringify({phase,status:report.status,checks:report.checks.length,screenshots:report.screenshots.length,error:report.error}));}

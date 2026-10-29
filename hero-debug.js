/* Opt-in localhost diagnostics. Enable with ?heroDebug=1; absent from normal/public pages. */
(() => {
  'use strict';
  if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)||new URLSearchParams(location.search).get('heroDebug')!=='1')return;
  const BUILD='hero-runtime-6',events=[],samples=[],client=crypto.randomUUID();
  const query=new URLSearchParams(location.search);
  let activeTest=null,lastSample=0,forceMotion=false;
  try{
    if(query.get('heroMotion')==='respect')sessionStorage.removeItem('poet:hero:preview-motion');
    forceMotion=query.get('heroMotion')!=='respect';
  }catch(_) { forceMotion=query.get('heroMotion')!=='respect'; }
  const panel=document.createElement('aside');panel.className='hero-runtime-debug';panel.setAttribute('aria-label','Development Hero diagnostics');
  panel.innerHTML='<details open><summary>Hero runtime · '+BUILD+'</summary><output class="hero-runtime-status"></output><div class="hero-runtime-actions"><button type="button" data-test="tile">TEST TILE DROP</button><button type="button" data-test="object">TEST OBJECT POP</button></div><p>Local tests stop the master. Replay Hero restores assembly and ambient motion.</p></details>';
  document.body.append(panel);
  function elementState(el){
    if(!el)return null;
    const style=getComputedStyle(el),r=el.getBoundingClientRect(),m=el.getScreenCTM?.();
    const origin=el.dataset.origin?.split(' ').map(Number),ground=origin&&m?new DOMPoint(...origin).matrixTransform(m):null;
    return{target:el.dataset.obj,transform:style.transform,svgTransform:el.getAttribute('transform'),opacity:style.opacity,origin:style.transformOrigin,groundContact:ground?{x:ground.x,y:ground.y}:null,rect:{x:r.x,y:r.y,width:r.width,height:r.height},screenCTM:m?{a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f}:null};
  }
  function status(){
    const w=window.POETWorld,m=w?.masterTimeline;
    return{build:BUILD,at:+performance.now().toFixed(1),state:w?.state||document.documentElement.dataset.worldState||'script-loading',gsap:window.gsap?.version||null,progress:m?+m.progress().toFixed(4):null,time:m?+m.time().toFixed(4):null,duration:m?.duration()??null,paused:m?.paused()??null,visibility:document.visibilityState,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,previewOverride:forceMotion,tiles:document.querySelectorAll('.hero--world .tile').length,worldObjects:document.querySelectorAll('.hero--world .build-item:not(.tile):not(.board)').length};
  }
  function log(event,extra={}){
    const data={event,...status(),...extra};events.push(data);if(events.length>500)events.shift();
    console.info('[POET HERO] '+event,JSON.stringify(data));window.dispatchEvent(new CustomEvent('poet:hero-diagnostic',{detail:data}));
    fetch('/__hero-runtime/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,client,userAgent:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight}}),keepalive:true}).catch(()=>{});
    return data;
  }
  function enableMotionPreview(){forceMotion=true;try{sessionStorage.setItem('poet:hero:preview-motion','full');}catch(_){}log('DEV_FULL_MOTION_OPT_IN');}
  function snapshot(el){return['style','transform','data-svg-origin'].map(name=>[name,el.getAttribute(name)]);}
  function restore(el,attributes){for(const[name,value]of attributes)value===null?el.removeAttribute(name):el.setAttribute(name,value);if(el._gsap)el._gsap.uncache=1;}
  function cancelTest(){if(!activeTest)return;const test=activeTest;activeTest=null;test.tween?.kill();restore(test.el,test.saved);log('CONTROLLED_TEST_CANCELLED',{kind:test.kind});}
  function test(kind){
    if(!window.gsap)return log('CONTROLLED_TEST_BLOCKED',{reason:'GSAP unavailable'});
    cancelTest();window.POETWorld?.destroy();
    const el=document.querySelector(kind==='tile'?'.hero--world .tile[data-order="0"]':'.hero--world .building');
    if(!el)return log('CONTROLLED_TEST_BLOCKED',{reason:'Existing target missing',kind});
    window.scrollTo({top:0,left:0,behavior:'instant'});
    const saved=snapshot(el),before=elementState(el),ctm=el.getScreenCTM(),distance=250/Math.hypot(ctm.c,ctm.d);
    const current=activeTest={kind,el,saved,tween:null};
    log('CONTROLLED_TEST_BEFORE',{kind,element:before,parents:[el.parentElement,el.ownerSVGElement].filter(Boolean).map(p=>({tag:p.tagName,transform:getComputedStyle(p).transform,svgTransform:p.getAttribute('transform')})),viewBox:el.ownerSVGElement.getAttribute('viewBox')});
    gsap.set(el,{svgOrigin:el.dataset.origin,smoothOrigin:false,force3D:false,opacity:1,...(kind==='tile'?{y:-distance}:{scale:.3})});
    log('CONTROLLED_TEST_START',{kind,element:elementState(el),distanceSVG:kind==='tile'?distance:0});
    let last=0;
    current.tween=gsap.to(el,{...(kind==='tile'?{y:0}:{scale:1}),duration:1.5,ease:kind==='tile'?'bounce.out':'back.out(2.2)',onUpdate(){
      if(performance.now()-last<100)return;last=performance.now();log('CONTROLLED_TEST_DURING',{kind,element:elementState(el)});
    },onComplete(){
      restore(el,saved);if(activeTest===current)activeTest=null;
      log('CONTROLLED_TEST_COMPLETE',{kind,element:elementState(el),restoredAttributes:saved.every(([name,value])=>el.getAttribute(name)===value)});
    }});
  }
  panel.querySelector('[data-test="tile"]').addEventListener('click',()=>test('tile'));
  panel.querySelector('[data-test="object"]').addEventListener('click',()=>test('object'));
  function tick(now){
    if(now-lastSample>=100){
      lastSample=now;const data=status(),tile=document.querySelector('.hero--world .tile');
      if(samples.length<1800)samples.push({...data,tile:elementState(tile)});
      panel.querySelector('output').textContent=`${data.state} | GSAP ${data.gsap||'MISSING'}\nvisibility: ${data.visibility}\nreduced motion: ${data.reducedMotion}\nlocal full-motion preview: ${forceMotion?'ON':'OFF'}\ntimeline: ${data.progress===null?'NOT CREATED':(data.progress*100).toFixed(1)+'%'} | paused: ${data.paused}\ntiles: ${data.tiles} | objects: ${data.worldObjects}${data.reducedMotion&&!forceMotion?'\nReplay Hero opts into full motion for this local tab.':''}`;
    }requestAnimationFrame(tick);
  }
  window.POETHeroDebug={build:BUILD,events,samples,log,status,elementState,cancelTest,enableMotionPreview,get forceMotion(){return forceMotion;},get activeTest(){return activeTest?.kind||null;}};
  requestAnimationFrame(tick);
})();

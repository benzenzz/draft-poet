// Bounded vertical-scroll progress drives a repeated horizontal sequence.
// No autoplay: GSAP's reusable tween only responds to scroll/layout changes.
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
// Match the full local Hero/carousel review; public hosts honor reduced motion.
const fullPreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('pressMotion')!=='respect';
const reduceMotion=()=>reduced.matches&&!fullPreview;
function initPressStrip(section){
  const label=section.querySelector('p'),slot=section.querySelector('.press-row-spacer'),track=section.querySelector('.press-logo-track');
  const template=track.firstElementChild.cloneNode(true);
  const gsap=window.gsap;
  let move,readFrame,paintFrame,lastTime=0,current=0,target=0,base=0,travel=150,suspended=false;
  if(gsap?.quickTo)move=gsap.quickTo(track,'x',{duration:.45,ease:'power3.out',force3D:true});
  function paint(){track.style.transform=`translate3d(${current}px,0,0)`;}
  function damp(time){
    paintFrame=undefined;
    const delta=lastTime?Math.min(time-lastTime,64):16;lastTime=time;
    current+=(target-current)*(1-Math.exp(-delta/100));
    if(Math.abs(target-current)<.02)current=target;
    paint();
    if(current!==target&&!suspended&&!reduceMotion())paintFrame=requestAnimationFrame(damp);
  }
  function setX(value,immediate=false){
    target=value;
    if(immediate||reduceMotion()){
      cancelAnimationFrame(paintFrame);paintFrame=undefined;lastTime=0;move?.tween.pause();current=target;
      if(gsap)gsap.set(track,{x:target,force3D:true});else paint();
    }else if(move)move(target);
    else if(!paintFrame)paintFrame=requestAnimationFrame(damp);
  }
  function update(immediate=false){
    readFrame=undefined;
    if(suspended)return;
    const bounds=section.getBoundingClientRect();
    // Use the central 80% of the viewport so small scrolls remain noticeable
    // while the section is readable. Position is still absolute and reversible.
    const progress=Math.max(0,Math.min(1,(innerHeight*.9-bounds.top)/(innerHeight*.8+bounds.height)));
    setX(base+(reduceMotion()?0:progress*travel),immediate);
  }
  function layout(){
    const bounds=section.getBoundingClientRect(),text=label.getBoundingClientRect(),row=slot.getBoundingClientRect();
    if(!bounds.width)return;
    const style=getComputedStyle(section),cardHeight=parseFloat(style.getPropertyValue('--press-card-height'));
    const period=track.firstElementChild.getBoundingClientRect().width;
    if(!period)return;
    const mobile=matchMedia('(max-width:600px)').matches;
    travel=mobile?240:300;
    const lead=mobile?text.left-bounds.left:text.right-bounds.left+32;
    base=lead-period*2;
    section.style.setProperty('--press-mask-width',`${text.right-bounds.left+32}px`);
    section.style.setProperty('--press-mask-height',`${text.bottom-bounds.top+12}px`);
    section.style.setProperty('--press-track-top',`${row.top-bounds.top+row.height/2-cardHeight/2-1}px`);
    const count=Math.max(4,Math.ceil((bounds.width+travel+period*2)/period)+1);
    while(track.children.length<count)track.append(template.cloneNode(true));
    while(track.children.length>count)track.lastElementChild.remove();
    update(true);
  }
  function onScroll(){if(!readFrame&&!suspended)readFrame=requestAnimationFrame(()=>update());}
  addEventListener('scroll',onScroll,{passive:true});
  new ResizeObserver(layout).observe(section);
  document.fonts.ready.then(layout);
  reduced.addEventListener('change',layout);
  addEventListener('pagehide',()=>{suspended=true;cancelAnimationFrame(readFrame);readFrame=undefined;cancelAnimationFrame(paintFrame);paintFrame=undefined;move?.tween.pause();});
  addEventListener('pageshow',()=>{suspended=false;layout();});
  document.addEventListener('visibilitychange',()=>{suspended=document.hidden;if(suspended){cancelAnimationFrame(readFrame);readFrame=undefined;cancelAnimationFrame(paintFrame);paintFrame=undefined;move?.tween.pause();}else layout();});
  layout();
}
function init(){document.querySelectorAll('[data-press-strip]').forEach(initPressStrip);}
// Module dependencies may execute while deferred GSAP scripts are still loading.
if(document.readyState!=='complete')addEventListener('load',init,{once:true});else init();

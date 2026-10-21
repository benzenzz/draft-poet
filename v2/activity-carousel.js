// The Home activity carousel has one playback timer and one transition owner.
// All image/text effects share a native document.timeline start time.
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
// An explicit local preview lets the reviewer see motion even with OS reduction.
const fullPreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('homeMotion')==='full';
const reduceMotion=()=>reduced.matches&&!fullPreview;
const HOLD_AFTER_TRANSITION=1500;
const EASE={imageOut:'ease-in-out',imageIn:'ease-in-out',textOut:'ease',textIn:'ease'};

export function initActivityCarousel(wrap){
  if(wrap.dataset.motionReady)return;
  wrap.dataset.motionReady='true';
  const viewport=wrap.querySelector('.activity-viewport');
  const slides=[...wrap.querySelectorAll('.activity-slide')];
  if(!viewport||!slides.length){wrap.querySelector('.activity-controls')?.setAttribute('hidden','');return;}
  const dots=[...wrap.querySelectorAll('[data-slide]')];
  const images=slides.map(slide=>slide.querySelector('.activity-cover'));
  const copies=slides.map(slide=>slide.querySelector('.activity-copy'));
  // One persistent CTA sits outside both animated image and copy layers.
  // Original links remain as layout slots and as the no-JavaScript fallback.
  const detailLinks=copies.map(copy=>copy.querySelector('.btn'));
  const detailLink=detailLinks[0].cloneNode(true);
  detailLink.classList.add('activity-static-cta');
  detailLink.hidden=true;
  wrap.append(detailLink);
  detailLinks.forEach(link=>{link.inert=true;link.tabIndex=-1;link.setAttribute('aria-hidden','true');});
  const originals=new Map(copies.flatMap(copy=>[...copy.querySelectorAll('h3,p,.activity-meta')].map(element=>[element,element.textContent])));
  const ready=new Map();
  let index=0,timer,visible=false,focused=false,hovered=false,suspended=false,handoff=false;
  let request=0,pending=null,transition=null,reflow=false,resizeFrame,touch=null,swiped=false;
  let captionPending=!reduceMotion(),headlinesReady=false;
  if(captionPending)wrap.dataset.captionPending='true';
  const canPlay=()=>slides.length>1&&visible&&!document.hidden&&!focused&&!hovered&&!suspended&&!touch&&!handoff&&!reduceMotion();
  const stop=()=>{clearTimeout(timer);timer=undefined;};

  function positionDetailLink(){
    const frame=wrap.getBoundingClientRect(),slots=detailLinks.map(link=>link.getBoundingClientRect());
    if(!frame.width||!slots[0].width)return;
    // Reserve the lowest existing slot so longer captions never touch the CTA.
    detailLink.style.top=`${Math.max(...slots.map(slot=>slot.top))-frame.top}px`;
    detailLink.style.left=`${(frame.width-slots[0].width)/2}px`;
    detailLink.hidden=false;
  }
  function updateDetailLink(){
    detailLink.href=detailLinks[index].href;
    detailLink.setAttribute('aria-label',`Xem thông tin chi tiết: ${originals.get(slides[index].querySelector('h3'))}`);
  }

  function schedule(){
    stop();
    revealVisibleCaption();
    viewport.setAttribute('aria-live',canPlay()?'off':'polite');
    if(canPlay()&&!captionPending&&pending===null&&transition===null)timer=setTimeout(()=>transitionToSlide((index+1)%slides.length,{automatic:true}),HOLD_AFTER_TRANSITION);
  }

  function ensureImage(next){
    if(ready.has(next))return ready.get(next);
    const image=images[next];
    if(!image)return Promise.resolve(false);
    image.decoding='sync';
    if(image.dataset.src){
      image.loading='eager';
      image.srcset=image.dataset.srcset;
      image.src=image.dataset.src;
      delete image.dataset.src;delete image.dataset.srcset;
    }
    const result=image.decode().then(()=>image.naturalWidth>0).catch(()=>false);
    ready.set(next,result);
    return result;
  }

  // Measure whole words into their actual rendered lines. Never split accents
  // or individual Vietnamese characters; whitespace and accessible text remain.
  function prepareCaptionLines(){
    if(transition){reflow=true;return;}
    reflow=false;
    for(const[heading,text]of originals){
      heading.textContent=text;
      const node=heading.firstChild,lines=[];
      for(const match of text.matchAll(/\S+/gu)){
        const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
        const top=range.getBoundingClientRect().top,last=lines.at(-1);
        if(last&&Math.abs(last.top-top)<2)last.words.push(match[0]);else lines.push({top,words:[match[0]]});
      }
      const content=[];
      lines.forEach((line,i)=>{if(i)content.push(document.createTextNode(' '));const span=document.createElement('span');span.className=heading.matches('h3')?'activity-heading-line activity-text-line':'activity-text-line';span.textContent=line.words.join(' ');content.push(span);});
      heading.replaceChildren(...content);
    }
    positionDetailLink();
  }

  function settleTransition(){
    const active=transition;transition=null;
    // Hide outgoing layers before restoring their base styles.
    slides.forEach(slide=>slide.classList.remove('is-leaving'));
    active?.animations.forEach(animation=>animation.cancel());
    if(reflow)prepareCaptionLines();
  }
  function invalidate(){request++;pending=null;stop();settleTransition();}

  function queueCaption(hide=true){
    captionPending=!reduceMotion();
    if(captionPending&&hide)wrap.dataset.captionPending='true';else delete wrap.dataset.captionPending;
  }

  // Run the line sequence when a caption becomes visible, including
  // a returning slide. Never consume that sequence outside the viewport.
  function animateCaption(active,start){
    const gentle=reduceMotion(),children=[...copies[index].children];
    const enter=(target,delay,duration)=>{
      const frames=gentle?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}];
      const animation=target.animate(frames,{delay,duration,easing:EASE.textIn,fill:'both'});
      animation.startTime=start;active.animations.push(animation);
    };
    enter(children[0],gentle?0:180,gentle?80:420);
    let delay=480;
    for(const element of children.slice(1).filter(child=>!child.matches('.btn'))){
      const lines=[...element.querySelectorAll(':scope>.activity-text-line')];
      for(const line of lines.length?lines:[element]){
        enter(line,gentle?0:delay,gentle?80:500);
        delay+=140;
      }
      delay+=100;
    }
  }
  function finishEffects(active){
    Promise.all(active.animations.map(animation=>animation.finished)).then(()=>{if(transition===active){settleTransition();schedule();}}).catch(()=>{});
  }
  function revealVisibleCaption(){
    if(!captionPending||!visible||handoff||suspended||document.hidden||!headlinesReady||transition||pending!==null)return;
    captionPending=false;
    if(!reduceMotion()){
      const active={animations:[]};transition=active;
      animateCaption(active,document.timeline.currentTime);
      finishEffects(active);
    }
    delete wrap.dataset.captionPending;
  }

  async function transitionToSlide(next,{automatic=false}={}){
    invalidate();
    captionPending=false;delete wrap.dataset.captionPending;
    if(next===index){schedule();return;}
    const token=request;pending=token;
    const loaded=await ensureImage(next);
    if(token!==request)return;
    pending=null;
    if(!loaded||suspended||(automatic&&!canPlay())){schedule();return;}
    const old=index;
    index=next;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
    slides[old].classList.add('is-leaving');
    dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
    updateDetailLink();
    if(!visible){settleTransition();queueCaption();schedule();return;}
    const active={animations:[]};transition=active;
    const start=document.timeline.currentTime;
    function animate(target,frames,delay,duration,easing){
      const animation=target.animate(frames,{delay,duration,easing,fill:'both'});
      animation.startTime=start;active.animations.push(animation);
    }
    const gentle=reduceMotion();
    // In the supplied recording the photograph dissolves first and settles
    // before the caption. Keep both photos in the same crop, without panning.
    animate(images[old],[{opacity:1},{opacity:0}],0,gentle?130:600,EASE.imageOut);
    animate(images[index],[{opacity:0},{opacity:1}],0,gentle?160:600,EASE.imageIn);
    animate(copies[old],[{opacity:1},{opacity:0}],0,gentle?70:180,EASE.textOut);
    // Each measured title/description line enters in reading order; the CTA
    // remains outside these effects and is available throughout the reveal.
    animateCaption(active,start);
    // One owner settles all effects; cancellation never queues another change.
    finishEffects(active);
    ensureImage((index+1)%slides.length);
    schedule();
  }

  slides.forEach((slide,i)=>{slide.inert=i!==0;slide.setAttribute('aria-hidden',String(i!==0));});
  wrap.classList.add('is-ready');wrap.querySelector('.activity-controls').hidden=slides.length<2;
  updateDetailLink();positionDetailLink();
  ensureImage(0);ensureImage(1);
  document.fonts.ready.then(()=>{prepareCaptionLines();headlinesReady=true;schedule();});
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>transitionToSlide(i)));
  wrap.querySelector('[data-activity-prev]')?.addEventListener('click',()=>transitionToSlide((index-1+slides.length)%slides.length));
  wrap.querySelector('[data-activity-next]')?.addEventListener('click',()=>transitionToSlide((index+1)%slides.length));
  function syncFocus(){
    // Pointer navigation must resume autoplay; retain pause for keyboard users.
    const active=document.activeElement;
    focused=wrap.contains(active)&&active.matches('a,button,[role="button"]')&&active.matches(':focus-visible');
    schedule();
  }
  wrap.addEventListener('focusin',syncFocus);
  wrap.addEventListener('focusout',()=>queueMicrotask(syncFocus));
  // Hovering the large thumbnail should not freeze the slideshow. Pause only
  // over its persistent link so its destination remains stable while clicking.
  function syncHover(event){
    if(event.pointerType!=='mouse')return;
    const target=event.type==='pointerout'?event.relatedTarget:event.target;
    const over=target instanceof Element&&!!target.closest('.activity-static-cta');
    if(hovered===over)return;
    hovered=over;schedule();
  }
  wrap.addEventListener('pointerover',syncHover);
  wrap.addEventListener('pointerout',syncHover);
  wrap.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?slides.length-1:(index+(event.key==='ArrowRight'?1:-1)+slides.length)%slides.length;
    dots[next].focus({preventScroll:true});transitionToSlide(next);
  });
  viewport.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse')return;swiped=false;touch={id:event.pointerId,x:event.clientX,y:event.clientY};stop();},{passive:true});
  viewport.addEventListener('pointerup',event=>{
    if(!touch||touch.id!==event.pointerId)return;
    const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){swiped=true;transitionToSlide((index+(dx<0?1:-1)+slides.length)%slides.length);}else schedule();
  },{passive:true});
  viewport.addEventListener('pointercancel',()=>{touch=null;schedule();},{passive:true});
  viewport.addEventListener('click',event=>{if(swiped){event.preventDefault();swiped=false;}},true);
  new IntersectionObserver(entries=>{
    const entry=entries[0];
    visible=entry.isIntersecting&&entry.intersectionRatio>=.35;
    if(!visible)invalidate();
    // Rearm below 25%, reveal above 35%; keep any exiting text readable.
    if(entry.intersectionRatio<.25)queueCaption(!entry.isIntersecting);
    schedule();
  },{threshold:[0,.25,.35]}).observe(viewport);
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(prepareCaptionLines);}).observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){invalidate();queueCaption();}schedule();});
  document.addEventListener('poet:hero-handoff',event=>{handoff=event.detail.phase==='start';if(handoff){invalidate();queueCaption();}schedule();});
  reduced.addEventListener('change',()=>{invalidate();if(reduceMotion()){captionPending=false;delete wrap.dataset.captionPending;}schedule();});
  addEventListener('pagehide',()=>{suspended=true;invalidate();});
  addEventListener('pageshow',()=>{suspended=false;schedule();});
  schedule();
}

document.querySelectorAll('[data-activity-carousel]').forEach(initActivityCarousel);

// The Home activity carousel has one playback timer and one transition owner.
// Only the photos crossfade (sharing one document.timeline start); the text of each slide is static.
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
// Match the approved plain-local Hero preview; public pages still honor the OS.
// Either explicit respect option lets reviewers test reduced-motion behavior.
const query=new URLSearchParams(location.search);
const fullPreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&query.get('homeMotion')!=='respect'&&query.get('heroMotion')!=='respect'&&query.get('heroDebug')!=='0';
const reduceMotion=()=>reduced.matches&&!fullPreview;
const HOLD_AFTER_TRANSITION=1500;
const EASE={imageOut:'ease-in-out',imageIn:'ease-in-out'};

export function initActivityCarousel(wrap){
  if(wrap.dataset.motionReady)return;
  wrap.dataset.motionReady='true';
  const viewport=wrap.querySelector('.activity-viewport');
  const slides=[...wrap.querySelectorAll('.activity-slide')];
  if(!viewport||!slides.length){wrap.querySelector('.activity-controls')?.setAttribute('hidden','');return;}
  const dots=[...wrap.querySelectorAll('[data-slide]')];
  const images=slides.map(slide=>slide.querySelector('.activity-cover'));
  const copies=slides.map(slide=>slide.querySelector('.activity-copy'));
  // One persistent CTA sits outside the slides so it never changes with them.
  // Original links remain as layout slots and as the no-JavaScript fallback.
  const detailLinks=copies.map(copy=>copy.querySelector('.btn'));
  const detailLink=detailLinks[0].cloneNode(true);
  detailLink.classList.add('activity-static-cta');
  detailLink.hidden=true;
  wrap.append(detailLink);
  detailLinks.forEach(link=>{link.inert=true;link.tabIndex=-1;link.setAttribute('aria-hidden','true');});
  const ready=new Map();
  let index=0,timer,visible=false,focused=false,hovered=false,suspended=false,handoff=false;
  let request=0,pending=null,transition=null,resizeFrame,touch=null,swiped=false;
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
    detailLink.setAttribute('aria-label',`Xem thông tin chi tiết: ${slides[index].querySelector('h3').textContent}`);
  }

  function schedule(){
    stop();
    viewport.setAttribute('aria-live',canPlay()?'off':'polite');
    if(canPlay()&&pending===null&&transition===null)timer=setTimeout(()=>transitionToSlide((index+1)%slides.length,{automatic:true}),HOLD_AFTER_TRANSITION);
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

  function settleTransition(){
    const active=transition;transition=null;
    // Hide outgoing layers before restoring their base styles.
    slides.forEach(slide=>slide.classList.remove('is-leaving'));
    active?.animations.forEach(animation=>animation.cancel());
  }
  function invalidate(){request++;pending=null;stop();settleTransition();}

  function finishEffects(active){
    Promise.all(active.animations.map(animation=>animation.finished)).then(()=>{if(transition===active){settleTransition();schedule();}}).catch(()=>{});
  }
  async function transitionToSlide(next,{automatic=false}={}){
    invalidate();
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
    if(!visible){settleTransition();schedule();return;}
    const active={animations:[]};transition=active;
    const start=document.timeline.currentTime;
    function animate(target,frames,delay,duration,easing){
      const animation=target.animate(frames,{delay,duration,easing,fill:'both'});
      animation.startTime=start;active.animations.push(animation);
    }
    const gentle=reduceMotion();
    // The photographs crossfade in the same crop, without panning. The old slide's text is
    // hidden by CSS (.is-leaving) and the new one is already in place, so no text moves.
    animate(images[old],[{opacity:1},{opacity:0}],0,gentle?130:600,EASE.imageOut);
    animate(images[index],[{opacity:0},{opacity:1}],0,gentle?160:600,EASE.imageIn);
    // One owner settles all effects; cancellation never queues another change.
    finishEffects(active);
    ensureImage((index+1)%slides.length);
    schedule();
  }

  slides.forEach((slide,i)=>{slide.inert=i!==0;slide.setAttribute('aria-hidden',String(i!==0));});
  wrap.classList.add('is-ready');wrap.querySelector('.activity-controls').hidden=slides.length<2;
  updateDetailLink();positionDetailLink();
  ensureImage(0);ensureImage(1);
  document.fonts.ready.then(()=>{positionDetailLink();schedule();});
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
    schedule();
  },{threshold:[0,.25,.35]}).observe(viewport);
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(positionDetailLink);}).observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)invalidate();schedule();});
  document.addEventListener('poet:hero-handoff',event=>{handoff=event.detail.phase==='start';if(handoff)invalidate();schedule();});
  reduced.addEventListener('change',()=>{invalidate();schedule();});
  addEventListener('pagehide',()=>{suspended=true;invalidate();});
  addEventListener('pageshow',()=>{suspended=false;schedule();});
  schedule();
}

document.querySelectorAll('[data-activity-carousel]').forEach(initActivityCarousel);

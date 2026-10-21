// The Home activity carousel has one playback timer and one transition owner.
// All image/text effects share a native document.timeline start time.
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const small=matchMedia('(max-width:600px)');
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
  const originals=new Map(slides.map(slide=>{const heading=slide.querySelector('h3');return[heading,heading.textContent];}));
  const ready=new Map();
  let index=0,timer,visible=false,focused=false,hovered=false,suspended=false,handoff=false;
  let request=0,pending=null,transition=null,reflow=false,resizeFrame,touch=null,swiped=false;
  const canPlay=()=>slides.length>1&&visible&&!document.hidden&&!focused&&!hovered&&!suspended&&!touch&&!handoff&&!reduced.matches;
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

  // Measure whole words into their actual rendered lines. Never split accents
  // or individual Vietnamese characters; whitespace and accessible text remain.
  function prepareHeadlines(){
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
      lines.forEach((line,i)=>{if(i)content.push(document.createTextNode(' '));const span=document.createElement('span');span.className='activity-heading-line';span.textContent=line.words.join(' ');content.push(span);});
      heading.replaceChildren(...content);
    }
    positionDetailLink();
  }

  function settleTransition(){
    const active=transition;transition=null;
    // Hide outgoing layers before restoring their base styles.
    slides.forEach(slide=>slide.classList.remove('is-leaving'));
    active?.animations.forEach(animation=>animation.cancel());
    if(reflow)prepareHeadlines();
  }
  function invalidate(){request++;pending=null;stop();settleTransition();}

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
    const active={animations:[]};transition=active;
    const start=document.timeline.currentTime;
    function animate(target,frames,delay,duration,easing){
      const animation=target.animate(frames,{delay,duration,easing,fill:'both'});
      animation.startTime=start;active.animations.push(animation);
    }
    const gentle=reduced.matches;
    // In the supplied recording the photograph dissolves first and settles
    // before the caption. Keep both photos in the same crop, without panning.
    animate(images[old],[{opacity:1},{opacity:0}],0,gentle?130:600,EASE.imageOut);
    animate(images[index],[{opacity:0},{opacity:1}],0,gentle?160:600,EASE.imageIn);
    animate(copies[old],[{opacity:1},{opacity:0}],0,gentle?70:180,EASE.textOut);
    const children=[...copies[index].children],headline=copies[index].querySelector('h3');
    const enter=(target,delay,duration,scale)=>animate(target,gentle?[{opacity:0},{opacity:1}]:[{opacity:0,transform:`scale(${scale})`},{opacity:1,transform:'scale(1)'}],delay,duration,EASE.textIn);
    // Match the reference's label -> complete headline reveal. A multiline
    // headline scales as one readable phrase, with Vietnamese accents intact.
    enter(children[0],gentle?85:550,gentle?80:650,small.matches?1.06:1.15);
    enter(headline,gentle?95:800,gentle?80:800,small.matches?1.08:1.2);
    children.slice(2).filter(child=>!child.matches('.btn')).forEach(child=>enter(child,gentle?105:950,gentle?80:550,small.matches?1.025:1.04));
    // One owner settles all effects; cancellation never queues another change.
    Promise.all(active.animations.map(animation=>animation.finished)).then(()=>{if(transition===active){settleTransition();schedule();}}).catch(()=>{});
    ensureImage((index+1)%slides.length);
    schedule();
  }

  slides.forEach((slide,i)=>{slide.inert=i!==0;slide.setAttribute('aria-hidden',String(i!==0));});
  wrap.classList.add('is-ready');wrap.querySelector('.activity-controls').hidden=slides.length<2;
  updateDetailLink();positionDetailLink();
  ensureImage(0);ensureImage(1);
  document.fonts.ready.then(prepareHeadlines);
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>transitionToSlide(i)));
  wrap.querySelector('[data-activity-prev]')?.addEventListener('click',()=>transitionToSlide((index-1+slides.length)%slides.length));
  wrap.querySelector('[data-activity-next]')?.addEventListener('click',()=>transitionToSlide((index+1)%slides.length));
  function syncFocus(){
    // Hero handoff focuses its reading heading after a pointer click. Keep that
    // handoff playing; pause for interactive focus or a visible keyboard focus.
    const active=document.activeElement;
    focused=wrap.contains(active)&&active.matches('a,button,[role="button"],:focus-visible');
    if(focused)invalidate();schedule();
  }
  wrap.addEventListener('focusin',syncFocus);
  wrap.addEventListener('focusout',()=>queueMicrotask(syncFocus));
  wrap.addEventListener('pointerenter',event=>{if(event.pointerType!=='mouse')return;hovered=true;invalidate();schedule();});
  wrap.addEventListener('pointerleave',event=>{if(event.pointerType!=='mouse')return;hovered=false;schedule();});
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
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.35;if(!visible)invalidate();schedule();},{threshold:[0,.35]}).observe(viewport);
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(prepareHeadlines);}).observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)invalidate();schedule();});
  document.addEventListener('poet:hero-handoff',event=>{handoff=event.detail.phase==='start';if(handoff)invalidate();schedule();});
  reduced.addEventListener('change',()=>{invalidate();schedule();});
  addEventListener('pagehide',()=>{suspended=true;invalidate();});
  addEventListener('pageshow',()=>{suspended=false;schedule();});
  schedule();
}

document.querySelectorAll('[data-activity-carousel]').forEach(initActivityCarousel);

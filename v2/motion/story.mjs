// Scroll story (UI-023 "Một khoảng sân", UI-024 project details). Takes over from site.js.
// The photo stage stays pinned with position:sticky; the page scrolls natively.
// When a step's text crosses the reading line, its photo wipes up in place over the
// previous one and the text slides up line by line. Scrolling back reverses the wipe.
// All motion is CSS transitions on transform/opacity/clip-path; this file only reads
// positions once per frame and flips attributes.
import {splitWords,staggerLines} from './split.mjs?v=anim-1';

const pad=n=>String(n).padStart(2,'0');

export function initStories({full}){
  const sections=[...document.querySelectorAll('.project-story')];
  const openers=[...document.querySelectorAll('.story-open')];
  if(!sections.length&&!openers.length)return;
  openers.forEach(el=>initOpener(el,full));
  const stories=sections.map(sec=>initStory(sec,full)).filter(Boolean);
  if(!stories.length)return;
  let raf=0;
  const update=()=>{raf=0;stories.forEach(s=>s.update());};
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);
  update();
}

function initStory(sec,full){
  const frames=[...sec.querySelectorAll('.story-stage .story-frame')];
  const steps=[...sec.querySelectorAll('.story-step')];
  if(!frames.length||frames.length!==steps.length)return null;
  const desk=matchMedia('(min-width:901px)');
  sec.classList.add('m-story');
  frames.forEach((f,i)=>{f.classList.remove('is-on','is-prev');f.style.zIndex=String(i+1);f.dataset.mState=i===0?'on':'below';});

  // Step counter on the stage: "01 / 04", the number rolls with the photo.
  const count=document.createElement('div');
  count.className='m-story-count';count.setAttribute('aria-hidden','true');
  count.innerHTML=`<span class="m-roll"><span class="m-roll-col">${steps.map((s,i)=>`<span>${pad(i+1)}</span>`).join('')}</span></span><span class="m-roll-total">/ ${pad(steps.length)}</span>`;
  const col=count.querySelector('.m-roll-col');
  sec.querySelector('.story-stage').append(count);

  // Text parts that slide in by line; chips and other blocks rise as units.
  const parts=steps.map(step=>{
    const lines=[...step.querySelectorAll(':scope>.when,:scope>.story-line')];
    const units=[...step.querySelectorAll(':scope>.pd-chips>li')];
    if(full)lines.forEach(splitWords);
    return {lines,units};
  });

  const revealed=new Set();
  const reveal=i=>{
    if(revealed.has(i))return;revealed.add(i);
    if(!full){steps[i].classList.add('m-in');return;}
    let t=0;
    for(const el of parts[i].lines){
      const n=staggerLines(el,{base:t,step:90});
      el.querySelectorAll('mark').forEach(m=>{m.style.transitionDelay=`${t+n*90+420}ms`;});
      t+=n*90+60;
    }
    parts[i].units.forEach((u,k)=>{u.style.transitionDelay=`${t+k*45}ms`;});
    steps[i].classList.add('m-in');
  };

  let cur=-1;
  const setActive=i=>{
    if(i===cur)return;cur=i;
    frames.forEach((f,k)=>{f.dataset.mState=k<i?'above':k===i?'on':'below';});
    steps.forEach((s,k)=>s.classList.toggle('is-active',k===i));
    col.style.transform=`translateY(${-i/steps.length*100}%)`;
  };

  const anchorOf=step=>step.querySelector(':scope>.when,:scope>.story-line')||step;
  return {update(){
    // Desktop: text and photo change together at the reading line. Phones: the card's
    // words slide in as it enters, and the pinned photo swaps when the card reaches it.
    const vh=innerHeight,line=vh*(desk.matches?.7:.6),enter=desk.matches?line:vh*.9;
    let active=0;
    steps.forEach((s,i)=>{const top=anchorOf(s).getBoundingClientRect().top;if(top<enter)reveal(i);if(top<line)active=i;});
    setActive(active);
  }};
}

// Story opener / project hero: the photo settles, the title rises line by line.
function initOpener(el,full){
  el.classList.add('m-open');
  if(!full)return;
  const text=[...el.querySelectorAll('.story-open-text:not([hidden]) :is(h1,h2)')];
  text.forEach(splitWords);
  const go=()=>{
    let t=120;
    text.forEach(h=>{t+=staggerLines(h,{base:t,step:110})*110;});
    el.style.setProperty('--m-after',`${t+80}ms`);
    el.classList.add('m-in');
  };
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();requestAnimationFrame(go);}},{threshold:.25});
  document.fonts?.ready.then(()=>io.observe(el))??io.observe(el);
}

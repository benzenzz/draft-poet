// Numbers that count up once when they come into view, plus the two progress bars
// that are not driven by fundraising-reveal.mjs (trip countdown, budget split).
// The HTML always holds the final values; offscreen numbers are zeroed at load so
// nothing visibly snaps back to 0. [data-counter] and the fundraising card keep their own code.
const easeOutExpo=t=>t===1?1:1-2**(-10*t);
const NUMBER=/^(\s*)(\d{1,3}(?:\.\d{3})+|\d+)/;
const GROUPS='.pd-stats,.story-card .inline-metrics,.budget-sum';
const ITEMS='.pd-stat>b,.inline-metrics>li,.budget-sum>strong';

// Hidden tab panels count as offscreen: they start from 0 when first shown.
const offscreen=el=>{if(!el.getClientRects().length)return true;const r=el.getBoundingClientRect();return r.top>innerHeight||r.bottom<0;};
const whenSeen=(el,threshold,fn)=>{
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();fn();}},{threshold});
  io.observe(el);
};

// Wraps the leading number of an item in a fixed-width span; returns the counter or null.
function counter(item){
  if(item.closest('[data-counter],[data-fundraising]')||item.querySelector('[data-counter]'))return null;
  const walker=document.createTreeWalker(item,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode())&&!node.data.trim());
  const m=node&&node.data.match(NUMBER);if(!m)return null;
  const raw=m[2],value=Number(raw.replace(/\./g,'')),grouped=raw.includes('.');
  if(!Number.isSafeInteger(value)||value<2)return null;
  // A custom tag, so page rules for spans inside these items (labels) never touch it.
  const span=document.createElement('m-num');span.textContent=raw;
  node.data=node.data.slice(m[0].length);node.before(m[1],span);
  span.style.minWidth=`${span.getBoundingClientRect().width}px`;
  const format=n=>grouped?new Intl.NumberFormat('vi-VN').format(n):String(n);
  return {span,value,format,set(t){span.textContent=format(Math.round(value*easeOutExpo(t)));}};
}

function run(counters,{delay=0,duration=1600,step=120}={}){
  const start=performance.now()+delay;
  const tick=now=>{
    let done=true;
    counters.forEach((c,i)=>{const t=Math.min(1,Math.max(0,(now-start-i*step)/duration));c.set(t);if(t<1)done=false;});
    if(!done)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initNumbers(){
  document.fonts?.ready.then(setup)??setup();
}

function setup(){
  for(const group of document.querySelectorAll(GROUPS)){
    const counters=[...group.querySelectorAll(ITEMS)].map(counter).filter(Boolean);
    if(!counters.length)continue;
    // Hero stats wait for the title to land; everything else starts as it arrives.
    const delay=group.closest('.story-open')?520:0;
    if(offscreen(group))counters.forEach(c=>c.set(0));
    whenSeen(group,.5,()=>run(counters,{delay}));
  }
  for(const stack of document.querySelectorAll('.budget-stack'))budgetStack(stack);
  for(const track of document.querySelectorAll('.fund-timeline-track'))timeline(track);
}

// Budget split: one left-to-right wipe across the segments, explaining where the money goes.
function budgetStack(stack){
  if(!offscreen(stack))return;
  stack.classList.add('m-pre');
  // Watch the total above it: the observer measures the clipped (empty) stack as invisible.
  whenSeen(stack.previousElementSibling||stack.parentElement,.5,()=>{
    stack.classList.add('m-in');
    // Drop the clip once filled so the row hover can lift a segment past the edge.
    setTimeout(()=>stack.classList.remove('m-pre','m-in'),1600);
  });
}

// Trip countdown: the bar grows from 0 and the dot rides its edge.
function timeline(track){
  const bar=track.querySelector('i'),dot=track.querySelector('b');if(!bar||!dot)return;
  const opts={duration:1400,easing:'cubic-bezier(.23,1,.32,1)',delay:200};
  const pre=offscreen(track);
  if(pre){bar.style.transform='scaleX(0)';}
  whenSeen(track,.9,()=>{
    const x=dot.offsetLeft+dot.offsetWidth/2;
    bar.style.transform='';
    bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{...opts,fill:'backwards'});
    dot.animate([{transform:`translateX(${-x}px)`},{transform:'translateX(0)'}],{...opts,fill:'backwards'});
  });
}

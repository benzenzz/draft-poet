// Gentle one-time entrances where they help reading: the six plan stations,
// the project gallery and the pull quote. Elements already on screen at load stay put.
import {splitWords,staggerLines} from './split.mjs?v=anim-1';

const offscreen=el=>el.getBoundingClientRect().top>innerHeight;

function group(container,items,{threshold=.2,step=50}={}){
  if(!container||!items.length||!offscreen(container))return;
  items.forEach(el=>el.classList.add('m-rise'));
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;io.unobserve(e.target);
    // Items arriving together stagger; a lone late item enters on its own.
    const batch=items.filter(el=>!el.classList.contains('m-in')&&el.getBoundingClientRect().top<innerHeight);
    batch.forEach((el,i)=>{el.style.transitionDelay=`${i*step}ms`;el.classList.add('m-in');});
  }),{threshold});
  items.forEach(el=>io.observe(el));
}

export function initReveals(){
  group(document.querySelector('.plan-stations'),[...document.querySelectorAll('.plan-station')]);
  group(document.querySelector('.pd-grid'),[...document.querySelectorAll('.pd-g')],{threshold:.15,step:60});
  const quote=document.querySelector('.pd-quote');
  if(quote&&offscreen(quote)){
    const p=quote.querySelector('blockquote p');
    splitWords(p);quote.classList.add('m-quote');
    const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();
      const n=staggerLines(p,{base:150,step:90});
      quote.style.setProperty('--m-after',`${150+n*90+100}ms`);
      quote.classList.add('m-in');
    }},{threshold:.35});
    io.observe(quote);
  }
}

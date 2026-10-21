// Home-only presentation. Financial calculation and checkout stay elsewhere.
export function createFundraisingReveal(card) {
  if(!card.hasAttribute('data-fund-animate'))return null;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const format=n=>new Intl.NumberFormat('vi-VN').format(n);
  let frame,observer,running=false,disposed=false,played=card.dataset.fundAnimated==='true',state,raised;
  const total=card.querySelector('[data-fund-raised]');
  const counters=[...card.querySelectorAll('[data-fund-count]')];
  function reserveNumbers(){
    const ctx=document.createElement('canvas').getContext('2d');
    for(const number of card.querySelectorAll('.fund-number')){
      ctx.font=getComputedStyle(number).font;
      const widest=[...'0123456789'].reduce((a,b)=>ctx.measureText(a).width>=ctx.measureText(b).width?a:b);
      number.dataset.fundReserve=number.dataset.fundFinal.replace(/\d/g,widest);
    }
  }
  function finalValues(){
    total.textContent=state.known?format(raised):'—';
    for(const counter of counters)counter.textContent=format(Number(counter.dataset.fundCount));
    card.style.removeProperty('--fund-display-progress');
  }
  function finish(){
    cancelAnimationFrame(frame);running=false;played=true;card.dataset.fundAnimated='true';
    finalValues();card.dataset.fundMotion='done';observer?.disconnect();
  }
  function start(){
    if(played)return;
    if(reduced.matches||!state.known){finish();return;}
    played=true;running=true;card.dataset.fundAnimated='true';observer?.disconnect();
    // Write the first frame before exposing the numeric layer: no final-value flash.
    total.textContent='0';counters.forEach(counter=>counter.textContent='0');
    card.style.setProperty('--fund-display-progress','0%');card.dataset.fundMotion='running';
    const startTime=performance.now();
    const tick=now=>{
      const elapsed=Math.max(0,now-startTime),amountProgress=Math.min(1,elapsed/500),countProgress=Math.min(1,elapsed/750);
      total.textContent=format(amountProgress===1?raised:Math.round(raised*amountProgress));
      card.style.setProperty('--fund-display-progress',`${state.progress*amountProgress}%`);
      counters.forEach(counter=>{const value=Number(counter.dataset.fundCount);counter.textContent=format(countProgress===1?value:Math.round(value*countProgress));});
      if(countProgress<1)frame=requestAnimationFrame(tick);else finish();
    };
    frame=requestAnimationFrame(tick);
  }
  function update(next,amount){
    const interrupted=running;
    state=next;raised=amount;
    finalValues();
    card.querySelector('[data-fund-raised-label]').textContent=state.known?`${format(raised)} VNĐ`:'Số tiền đang chờ cập nhật';
    for(const number of card.querySelectorAll('.fund-number'))number.dataset.fundFinal=number.querySelector('span').textContent;
    reserveNumbers();
    if(interrupted){finish();return;}
    if(played||reduced.matches)finish();
  }
  const onMotionChange=()=>{if(reduced.matches)finish();};
  reduced.addEventListener('change',onMotionChange);
  return {update,observe(){
    if(played||reduced.matches||!('IntersectionObserver'in window)){finish();return;}
    document.fonts.ready.then(()=>{
      if(disposed)return;
      reserveNumbers();
      observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.35))start();},{threshold:[0,.35]});
      observer.observe(card);
    });
  },disconnect(){disposed=true;cancelAnimationFrame(frame);observer?.disconnect();reduced.removeEventListener('change',onMotionChange);}};
}

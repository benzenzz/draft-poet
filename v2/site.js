import '../ung-ho/checkout.js';
import {initFundraisingProgress} from './fundraising-progress.mjs?v=header-about-funding-1';
initFundraisingProgress();
const base=new URL('.',import.meta.url),root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const money=n=>new Intl.NumberFormat('vi-VN').format(n)+' đ';
const byId=id=>document.getElementById(id);
const toast=document.createElement('div');toast.className='site-toast';toast.setAttribute('role','status');document.body.append(toast);
let toastTimer;
function notify(text){toast.textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.textContent='';},3500);}
function trapFocus(modal){modal.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusable=[...modal.querySelectorAll('a[href],button,input,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});}

// Nested, deep-linkable tabs. No JS means every panel remains readable.
const tabControllers=[];
document.querySelectorAll('[role=tablist]').forEach(list=>{
  const tabs=[...list.querySelectorAll('[role=tab]')];
  function select(tab,{focus=false,update=false}={}){
    tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;byId(t.getAttribute('aria-controls')).hidden=!on;});
    // A deep-linked nested tab may become visible only after its parent is selected.
    // Scroll the tab rail horizontally on the next frame without moving the page.
    requestAnimationFrame(()=>{const rail=list.getBoundingClientRect(),item=tab.getBoundingClientRect();if(rail.width&&(item.left<rail.left||item.right>rail.right))list.scrollLeft+=item.left-rail.left-Math.max(0,(rail.width-item.width)/2);});
    if(focus){tab.focus();tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
    if(update)history.replaceState(null,'','#'+tab.getAttribute('aria-controls'));
  }
  list.addEventListener('click',e=>{const t=e.target.closest('[role=tab]');if(t)select(t,{update:true});});
  list.addEventListener('keydown',e=>{
    const i=tabs.indexOf(document.activeElement);if(i<0)return;
    let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();select(tabs[next],{focus:true,update:true});}
  });
  tabControllers.push({tabs,select});
  const preferred=document.querySelector('[data-default-tab]')?.dataset.defaultTab;
  select(tabs.find(t=>t.getAttribute('aria-controls')===preferred)||tabs[0]);
});
function revealHash(scroll=false){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=byId(id);if(!target)return;
  let node=target;
  while(node){
    if(node.matches?.('[role=tabpanel]')){const c=tabControllers.find(c=>c.tabs.some(t=>t.getAttribute('aria-controls')===node.id));if(c)c.select(c.tabs.find(t=>t.getAttribute('aria-controls')===node.id));}
    if(node instanceof HTMLDetailsElement)node.open=true;
    node=node.parentElement;
  }
  if(scroll)target.scrollIntoView({block:'start',behavior:'instant'});
}
revealHash(Boolean(location.hash));addEventListener('hashchange',()=>revealHash(true));
document.querySelectorAll('.story-card a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const detail=byId(a.hash.slice(1));if(detail instanceof HTMLDetailsElement)detail.open=true;}));

import './activity-carousel.js?v=poet-v3-1';
import './press-strip.js?v=poet-v3-1';

// Native touch scrolling, real mouse drag, buttons and arrow-key alternatives.
document.querySelectorAll('[data-carousel]').forEach(wrap=>{
  const rail=wrap.querySelector('.rail'),prev=wrap.querySelector('[data-prev]'),next=wrap.querySelector('[data-next]'),count=wrap.querySelector('.rail-count');
  let drag=null,ignoreClick=false;
  // Count reachable scroll positions, not articles: several cards can be visible,
  // and their start offsets can clamp to the same final position.
  const tolerance=1;
  let positions=[0],announceTimer;
  function announce(){
    const current=positions.reduce((best,left,i)=>Math.abs(left-rail.scrollLeft)<Math.abs(positions[best]-rail.scrollLeft)?i:best,0);
    const text=`Vị trí ${current+1} / ${positions.length}`;
    if(count.textContent!==text)count.textContent=text;
  }
  function update(){prev.disabled=rail.scrollLeft<=positions[0]+tolerance;next.disabled=rail.scrollLeft>=positions.at(-1)-tolerance;}
  function refresh(){
    const max=Math.max(0,rail.scrollWidth-rail.clientWidth),edge=rail.getBoundingClientRect().left+rail.clientLeft;
    positions=[];
    for(const card of rail.children){
      const left=Math.max(0,Math.min(max,card.getBoundingClientRect().left-edge+rail.scrollLeft));
      if(!positions.length||left-positions.at(-1)>tolerance)positions.push(left);
    }
    if(!positions.length)positions=[0];
    if(max-positions.at(-1)>tolerance)positions.push(max);
    else if(positions.length>1)positions[positions.length-1]=max;
    clearTimeout(announceTimer);update();announce();
  }
  const move=dir=>{
    const left=dir>0?positions.find(left=>left>rail.scrollLeft+tolerance):positions.findLast(left=>left<rail.scrollLeft-tolerance);
    if(left!==undefined)rail.scrollTo({left,behavior:reduced.matches?'instant':'smooth'});
  };
  prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home'||e.key==='End')rail.scrollTo({left:e.key==='Home'?positions[0]:positions.at(-1),behavior:'instant'});else move(e.key==='ArrowRight'?1:-1);}});
  // Announce the settled position once, rather than each frame of a drag/smooth scroll.
  rail.addEventListener('scroll',()=>{update();clearTimeout(announceTimer);announceTimer=setTimeout(announce,150);},{passive:true});
  rail.addEventListener('scrollend',()=>{clearTimeout(announceTimer);update();announce();});
  const resize=new ResizeObserver(refresh);resize.observe(rail);[...rail.children].forEach(card=>resize.observe(card));
  rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,scroll:rail.scrollLeft,moved:false};ignoreClick=false;});
  addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6){drag.moved=true;rail.classList.add('is-dragging');e.preventDefault();rail.scrollLeft=drag.scroll-dx;}});
  addEventListener('pointerup',()=>{if(!drag)return;ignoreClick=drag.moved;drag=null;rail.classList.remove('is-dragging');});
  rail.addEventListener('dragstart',e=>e.preventDefault());
  rail.addEventListener('click',e=>{if(ignoreClick){e.preventDefault();e.stopPropagation();ignoreClick=false;}},true);
  refresh();
});

// Reveal once, with readable fallback; no global animation loop.
const reveals=document.querySelectorAll('[data-reveal]');
if('IntersectionObserver'in window&&!reduced.matches){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');io.unobserve(entry.target);}}),{threshold:.08});
  reveals.forEach(el=>{el.classList.add('will-reveal');io.observe(el);});
  reduced.addEventListener('change',e=>{if(e.matches){reveals.forEach(el=>el.classList.add('is-revealed'));io.disconnect();}});
}
const counters=document.querySelectorAll('[data-counter]');
if('IntersectionObserver'in window){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;io.unobserve(entry.target);const el=entry.target,n=Number(el.dataset.counter);
    if(reduced.matches)return;const start=performance.now();let frame;
    const tick=time=>{const t=Math.min(1,(time-start)/1350),value=Math.round(n*(1-(1-t)**3));el.textContent=new Intl.NumberFormat('vi-VN').format(value);if(t<1&&!reduced.matches)frame=requestAnimationFrame(tick);else el.textContent=new Intl.NumberFormat('vi-VN').format(n);};
    frame=requestAnimationFrame(tick);addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
  }),{threshold:.5});counters.forEach(el=>io.observe(el));
}

document.querySelectorAll('[data-journey]').forEach(journey=>{
  const buttons=[...journey.querySelectorAll('[data-stage]')],notes=JSON.parse(journey.parentElement.querySelector('[data-journey-notes]').textContent),output=byId('journey-note');
  let active=buttons[0],latched=false;
  const position=()=>{
    const figure=journey.querySelector('.journey-mascot'),dot=active.querySelector('.journey-dot');
    const r=journey.getBoundingClientRect(),d=dot.getBoundingClientRect();
    figure.style.transform=`translate3d(${d.left-r.left+d.width/2-figure.offsetWidth/2}px,${d.top-r.top-figure.offsetHeight-8}px,0)`;
  };
  const hide=()=>{output.hidden=true;buttons.forEach(t=>t.setAttribute('aria-expanded','false'));};
  const select=b=>{active=b;buttons.forEach(t=>{t.setAttribute('aria-pressed',String(t===b));t.setAttribute('aria-expanded',String(t===b));});output.textContent=notes[Number(b.dataset.stage)];output.hidden=false;position();};
  buttons.forEach(b=>{b.addEventListener('click',()=>{if(active===b&&latched){latched=false;hide();}else{latched=true;select(b);}});b.addEventListener('focus',()=>select(b));b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){latched=false;select(b);}});});
  journey.addEventListener('pointerleave',()=>{if(!latched&&!journey.contains(document.activeElement))hide();});
  journey.addEventListener('focusout',()=>queueMicrotask(()=>{if(!journey.contains(document.activeElement)){latched=false;hide();}}));
  journey.addEventListener('keydown',e=>{if(e.key==='Escape'){latched=false;hide();}});
  new ResizeObserver(position).observe(journey);position();
});

// Client-side correspondence only. A reviewed mailto draft never submits data.
document.querySelectorAll('[data-partner-form]').forEach(partnerForm=>{
  const draft=partnerForm.querySelector('.partner-draft'),text=partnerForm.elements.draft,mail=partnerForm.querySelector('[data-partner-mail]');
  const sync=()=>{mail.href=`mailto:poet.npo@gmail.com?subject=${encodeURIComponent('Đồng hành POET Mùa 6 — '+partnerForm.elements.company.value.trim())}&body=${encodeURIComponent(text.value)}`;};
  partnerForm.addEventListener('submit',e=>{
    e.preventDefault();if(!partnerForm.reportValidity())return;
    const f=partnerForm.elements;text.value=`Chào POET,\n\nMình là ${f.contact.value.trim()}, đại diện ${f.company.value.trim()}.\nEmail liên hệ: ${f.email.value.trim()}\nHình thức quan tâm: ${f.package.value}\n\n${f.message.value.trim()||'Nhờ POET tư vấn hình thức đồng hành phù hợp với đơn vị.'}\n\nCảm ơn POET!`;
    draft.hidden=false;sync();text.focus();
  });
  text.addEventListener('input',sync);
  partnerForm.querySelector('[data-copy-draft]').addEventListener('click',e=>{e.currentTarget.dataset.copy=text.value;});
  document.querySelectorAll('[data-partner-package]').forEach(a=>a.addEventListener('click',()=>{partnerForm.elements.package.value=a.dataset.partnerPackage;draft.hidden=true;partnerForm.elements.company.focus({preventScroll:true});}));
});

// Native modal supplies focus trapping, Escape and focus restoration.
const dialog=document.createElement('dialog');dialog.className='site-dialog';dialog.id='donation-dialog';dialog.setAttribute('aria-labelledby','donation-heading');
dialog.innerHTML=`<div class="site-dialog-inner"><button type="button" class="dialog-close" aria-label="Đóng hộp ủng hộ">×</button><div class="donate-aside"><p class="eyebrow">Ủng hộ cùng POET</p><h3>Một đóng góp nhỏ.<br>Một niềm vui lớn.</h3><p>Thanh toán an toàn qua PayOS. Mã QR và thông tin chuyển khoản sẽ hiển thị ở bước tiếp theo.</p><p>Bạn chỉ hoàn tất ủng hộ sau khi thanh toán được xác nhận.</p><img src="${new URL('../assets/mascot/be-cuc/vui-tuoi.webp',base)}" width="150" height="175" alt=""></div><form class="donate-form"><h2 id="donation-heading">Ủng hộ ngay</h2><label for="support-amount">Số tiền (VNĐ)</label><input id="support-amount" name="amount" type="number" inputmode="numeric" min="10000" max="20000000" step="1000" value="100000" required aria-describedby="amount-help"><div class="amount-chips">${[50000,100000,200000,500000].map(n=>`<button type="button" data-amount="${n}" aria-pressed="${n===100000}">${money(n)}</button>`).join('')}</div><p class="fine-print" id="amount-help">Từ 10.000 đ đến 20.000.000 đ, theo bội số 1.000 đ.</p><label for="support-name">Tên hiển thị</label><input id="support-name" name="displayName" autocomplete="name" maxlength="40" required><label class="check-label"><input type="checkbox" name="anonymous"> Tôi muốn ủng hộ ẩn danh</label><label for="support-note">Lời nhắn (không bắt buộc)</label><textarea id="support-note" name="message" maxlength="160" rows="2" aria-describedby="note-help"></textarea><p class="fine-print" id="note-help">Tối đa 160 ký tự. Tên và lời nhắn có thể xuất hiện trên tường sau khi thanh toán được xác nhận.</p><p class="donate-error" role="alert" hidden></p><button class="btn" type="submit">Tiếp tục đến mã QR <span aria-hidden="true">↗</span></button><p class="fine-print">Cần hỗ trợ? <a href="mailto:poet.npo@gmail.com">Liên hệ POET</a>.</p></form></div>`;
document.body.append(dialog);
trapFocus(dialog);
let donationsEnabled=null,opener;
const form=dialog.querySelector('form'),submit=form.querySelector('[type=submit]'),error=form.querySelector('.donate-error');
function closeDialog(){if(submit.dataset.busy)return;dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
dialog.addEventListener('cancel',e=>{if(submit.dataset.busy)e.preventDefault();});
dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});
document.addEventListener('click',async e=>{
  const a=e.target.closest('[data-donate]');if(!a)return;e.preventDefault();opener=a;dialog.showModal();document.body.style.overflow='hidden';error.hidden=true;
  form.elements.amount.focus();
  if(donationsEnabled===null){submit.disabled=true;submit.textContent='Vui lòng chờ…';try{const response=await fetch(`${window.POETCheckout.API_BASE}/api/settings`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const data=await response.json();donationsEnabled=data.donationsEnabled!==false;submit.disabled=!donationsEnabled;submit.textContent=donationsEnabled?'Tiếp tục đến mã QR':'Đang tạm dừng nhận ủng hộ';}catch{submit.disabled=false;submit.textContent='Tiếp tục đến mã QR';error.textContent='Chưa kiểm tra được trạng thái nhận ủng hộ. Bạn có thể thử tiếp hoặc liên hệ POET.';error.hidden=false;/* The checkout endpoint remains authoritative. */}}
});
form.querySelectorAll('[data-amount]').forEach(b=>b.addEventListener('click',()=>{form.elements.amount.value=b.dataset.amount;form.querySelectorAll('[data-amount]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));}));
form.elements.amount.addEventListener('input',()=>form.querySelectorAll('[data-amount]').forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.amount===form.elements.amount.value))));
form.elements.anonymous.addEventListener('change',()=>{form.elements.displayName.disabled=form.elements.anonymous.checked;form.elements.displayName.required=!form.elements.anonymous.checked;});
form.addEventListener('submit',async e=>{
  e.preventDefault();if(submit.dataset.busy||donationsEnabled===false)return;
  const amount=Number(form.elements.amount.value),anonymous=form.elements.anonymous.checked,name=form.elements.displayName.value.trim(),message=form.elements.message.value.trim();
  if(!Number.isInteger(amount)||amount<10000||amount>20000000||amount%1000){form.elements.amount.setCustomValidity('Chọn từ 10.000 đ đến 20.000.000 đ, theo bội số 1.000 đ.');form.elements.amount.reportValidity();form.elements.amount.setCustomValidity('');return;}
  if(!anonymous&&!name){form.elements.displayName.focus();error.textContent='Bạn điền tên hoặc chọn ủng hộ ẩn danh nhé.';error.hidden=false;return;}
  submit.dataset.busy='1';submit.disabled=true;submit.textContent='Đang mở thanh toán…';error.hidden=true;
  try{await window.POETCheckout.open({amount,displayName:anonymous?'':name,message,anonymous},{resultBase:new URL('../ung-ho/',base)});}catch(err){error.textContent=err instanceof TypeError?'Chưa kết nối được máy chủ. Bạn thử lại nhé.':err.message;error.hidden=false;delete submit.dataset.busy;submit.disabled=false;submit.textContent='Tiếp tục đến mã QR';error.tabIndex=-1;error.focus();}
});

// Copy controls include a selectable fallback when clipboard permission is unavailable.
document.addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);notify('Đã sao chép');}catch{
  const d=document.createElement('dialog');d.className='site-dialog copy-fallback';d.setAttribute('aria-label','Sao chép nội dung');d.innerHTML='<h2>Sao chép nội dung</h2><p>Chọn nội dung bên dưới và sao chép.</p><textarea readonly aria-label="Nội dung cần sao chép"></textarea><button type="button" class="btn">Đóng</button>';document.body.append(d);trapFocus(d);d.querySelector('textarea').value=b.dataset.copy;d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();b.focus();});d.showModal();d.querySelector('textarea').select();
}});

// Read-only real message data. Render untrusted donor text via textContent only.
const wall=document.querySelector('[data-message-wall]');
if(wall){let all=[],visible=3,loaded=false;const more=document.querySelector('[data-wall-more]'),retry=document.querySelector('[data-wall-retry]');
  const empty=text=>{wall.replaceChildren();const p=document.createElement('p');p.className='pending-box';p.textContent=text;wall.append(p);};
  function render(){wall.replaceChildren();if(!all.length){empty('Chưa có lời nhắn công khai. Bạn có thể gửi lời nhắn cùng lượt ủng hộ của mình.');return;}all.slice(0,visible).forEach(d=>{const card=document.createElement('article');card.className='message-card';const p=document.createElement('p'),name=document.createElement('strong'),amount=document.createElement('small');p.textContent=d.message||'Một đóng góp gửi đến POET.';p.dir='auto';name.textContent=d.displayName&&d.displayName!=='Ẩn danh'?d.displayName:'Một nhà hảo tâm';name.dir='auto';amount.textContent=money(d.amount);card.append(p,name,amount);wall.append(card);});more.hidden=visible>=all.length;}
  async function load(){retry.hidden=true;empty('Đang tải lời nhắn…');try{const response=await fetch(`${window.POETCheckout.API_BASE}/api/donations`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const data=await response.json();all=(Array.isArray(data.donations)?data.donations:[]).filter(d=>Number.isFinite(Number(d.amount))&&Number(d.amount)>0);loaded=true;render();}catch{empty('Chưa tải được tường lời nhắn. Bạn thử lại nhé.');retry.hidden=false;}}
  more.addEventListener('click',()=>{visible+=6;render();});retry.addEventListener('click',load);
  if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!loaded){io.disconnect();load();}},{rootMargin:'200px'});io.observe(wall);}else load();
}

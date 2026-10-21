import '../ung-ho/checkout.js';
import {initLocalFundraisingPreview} from './fundraising-preview.mjs';
import {initFundraisingProgress} from './fundraising-progress.mjs?v=ui-002-1';
initLocalFundraisingPreview();
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

import './activity-carousel.js?v=ui-002-1';
import './press-strip.js?v=poet-v3-1';

// Reveal once, with readable fallback; no global animation loop.
const reveals=document.querySelectorAll('[data-reveal]');
// Local previews play entrances even when the OS reports reduced motion, as world.js does; ?heroMotion=respect opts out.
const previewMotion=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('heroMotion')!=='respect';
if('IntersectionObserver'in window&&(!reduced.matches||previewMotion)){
  document.documentElement.classList.add('reveal-motion');
  // Wide screens show both archive cards together (CSS staggers the second); narrow screens reveal each card as it arrives.
  const wide=matchMedia('(min-width:761px)');
  const show=(entries,observer)=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const group=wide.matches&&entry.target.closest('.archive-grid');for(const el of group?group.querySelectorAll('[data-reveal]'):[entry.target]){el.classList.add('is-revealed');observer.unobserve(el);}});
  // Archive cards wait until clearly on screen so their entrance is actually seen.
  const io=new IntersectionObserver(show,{threshold:.08}),late=new IntersectionObserver(show,{threshold:.3});
  reveals.forEach(el=>{el.classList.add('will-reveal');(el.closest('.archive-grid')?late:io).observe(el);});
  reduced.addEventListener('change',e=>{if(e.matches&&!previewMotion){document.documentElement.classList.remove('reveal-motion');reveals.forEach(el=>el.classList.add('is-revealed'));io.disconnect();late.disconnect();}});
}
// Mission cards: rise in once at 25% visibility; hover, focus or click opens a card and it stays open.
const missionSection=document.querySelector('[data-mission]');
if(missionSection){
  const cards=[...missionSection.querySelectorAll('.mission-card')];
  missionSection.classList.add('is-interactive');
  cards.forEach(card=>['pointerenter','focus','click'].forEach(type=>card.addEventListener(type,()=>card.classList.add('is-open'))));
  if(document.documentElement.classList.contains('reveal-motion')){
    missionSection.classList.add('will-enter');
    const io=new IntersectionObserver(([entry],observer)=>{if(entry.isIntersecting){missionSection.classList.add('is-in');observer.disconnect();}},{threshold:.25});
    io.observe(missionSection);
  }
}
// Counters inside [data-counter-group] start together (staggered) when the group is visible; others count alone.
const counters=[...document.querySelectorAll('[data-counter]')].filter(el=>!el.closest('[data-counter-group]'));
const formatCount=n=>n<1000?String(n):new Intl.NumberFormat('vi-VN').format(n);
if('IntersectionObserver'in window){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;io.unobserve(entry.target);const el=entry.target,n=Number(el.dataset.counter);
    if(reduced.matches)return;const start=performance.now();let frame;
    const tick=time=>{const t=Math.min(1,(time-start)/1350),value=Math.round(n*(1-(1-t)**3));el.textContent=new Intl.NumberFormat('vi-VN').format(value);if(t<1&&!reduced.matches)frame=requestAnimationFrame(tick);else el.textContent=new Intl.NumberFormat('vi-VN').format(n);};
    frame=requestAnimationFrame(tick);addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
  }),{threshold:.5});counters.forEach(el=>io.observe(el));
  const easeOutExpo=t=>t===1?1:1-2**(-10*t);
  const groups=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;groups.unobserve(entry.target);
    if(reduced.matches&&!previewMotion)return;
    const group=entry.target,values=[...group.querySelectorAll('[data-counter]')];if(!values.length)return;
    // Zero only now, so the page, no-JS and thumbnails always show final values.
    values.forEach(el=>{el.textContent='0';});group.classList.add('is-counting');void group.offsetWidth;
    const frames=new Set();const start=performance.now();
    requestAnimationFrame(()=>group.classList.add('is-drawing'));
    values.forEach((el,i)=>{const n=Number(el.dataset.counter);
      const tick=time=>{const t=Math.min(1,Math.max(0,(time-start-i*150)/1800));el.textContent=formatCount(Math.round(n*easeOutExpo(t)));
        if(t<1){frames.add(requestAnimationFrame(tick));}else if(i===values.length-1)group.classList.remove('is-counting');};
      frames.add(requestAnimationFrame(tick));});
    addEventListener('pagehide',()=>{frames.forEach(cancelAnimationFrame);values.forEach(el=>{el.textContent=formatCount(Number(el.dataset.counter));});group.classList.remove('is-counting');},{once:true});
  }),{threshold:.4});
  document.querySelectorAll('[data-counter-group]').forEach(el=>groups.observe(el));
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

// Read-only real message data (UI-009 board). Render untrusted donor text via textContent only.
const wall=document.querySelector('[data-message-wall]');
// TODO(UI-009-backend): send {name,place,message,paper,glyph} to a reviewed-note endpoint once one exists in worker/. Until then nothing leaves the browser.
async function submitWallNote(payload){return {ok:false,reason:'composer-not-open',payload};}
if(wall){
  const board=wall.closest('[data-board]'),pagesNav=board.querySelector('[data-wall-pages]'),prev=board.querySelector('[data-wall-prev]'),next=board.querySelector('[data-wall-next]'),range=board.querySelector('[data-wall-range]'),retry=board.querySelector('[data-wall-retry]'),search=board.querySelector('[data-wall-search]'),sortButtons=[...board.querySelectorAll('[data-wall-sort]')],count=document.querySelector('[data-wall-count]');
  const iconBase=wall.dataset.iconBase,papers=wall.dataset.papers.split(' '),glyphs=wall.dataset.glyphs.split(' ');
  const phone=matchMedia('(max-width:640px)');
  const cache={},fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/gi,'d').toLowerCase();
  let sort='new',query='',page=1,loaded=false,list=[];
  const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.codePointAt(0),16777619);return h>>>0;};
  const ago=iso=>{const t=Date.parse(iso);if(!Number.isFinite(t))return '';const h=(Date.now()-t)/36e5;if(h<1)return 'Vừa xong';if(h<24)return `${Math.floor(h)} giờ trước`;if(h<24*7)return `${Math.floor(h/24)} ngày trước`;if(h<24*35)return `${Math.floor(h/168)} tuần trước`;return new Date(t).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});};
  const nameOf=d=>d.displayName&&d.displayName!=='Ẩn danh'?d.displayName:'Một nhà hảo tâm';
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null){e.textContent=text;e.dir='auto';}return e;};
  // Shared with the composer preview: {name,place,message,paper,glyph,amount,paidAt}.
  function noteCard(n){
    const card=el('article','message-card');card.style.setProperty('--paper',`var(--paper-${n.paper})`);
    const who=el('div','message-who'),glyph=el('span','message-glyph'),icon=el('span','prototype-icon'),names=el('div');
    icon.style.setProperty('--icon',`url('${iconBase}${n.glyph}.svg')`);icon.setAttribute('aria-hidden','true');glyph.append(icon);
    names.append(el('strong','',n.name));if(n.place)names.append(el('small','',n.place));who.append(glyph,names);
    const foot=el('div','message-foot');foot.append(el('span','',n.when));if(n.amount)foot.append(el('span','message-amount','+'+money(n.amount)));
    card.append(who,el('p','message-text',`“${n.message}”`),foot);return card;
  }
  const fromDonation=d=>{const h=hash(`${d.displayName||''}|${d.paidAt||''}`);return{name:nameOf(d),place:'',message:d.message||'Một đóng góp gửi đến POET.',paper:papers[h%papers.length],glyph:glyphs[Math.floor(h/papers.length)%glyphs.length],amount:Number(d.amount),when:ago(d.paidAt)};};
  const state=text=>{wall.replaceChildren(el('p','wall-state',text));};
  function pageList(total,cur){
    if(phone.matches)return Array.from({length:Math.min(3,total)},(_,i)=>Math.max(1,Math.min(cur-1,total-2))+i); // narrow row: current page and its neighbours only
    if(total<=7)return Array.from({length:total},(_,i)=>i+1);
    const out=[1];if(cur-1>2)out.push('…');for(let i=Math.max(2,cur-1);i<=Math.min(total-1,cur+1);i++)out.push(i);if(cur+1<total-1)out.push('…');out.push(total);return out;
  }
  // Centre the outside arrows on the notes (desktop) or on the page-number row (phone).
  function placeArrows(){const target=phone.matches?pagesNav:wall,b=board.getBoundingClientRect(),r=target.getBoundingClientRect();board.style.setProperty('--wall-nav-y',`${r.top-b.top+r.height/2}px`);}
  function render(){
    const per=phone.matches?3:6,q=fold(query.trim()),shown=q?list.filter(d=>fold(nameOf(d)).includes(q)):list,total=Math.max(1,Math.ceil(shown.length/per));
    page=Math.min(page,total);
    if(!list.length)state(wall.dataset.empty);else if(!shown.length)state(wall.dataset.noMatch);
    else wall.replaceChildren(...shown.slice((page-1)*per,page*per).map(d=>noteCard(fromDonation(d))));
    range.textContent=shown.length?`${(page-1)*per+1}–${Math.min(page*per,shown.length)} / ${shown.length} lời nhắn`:'';
    pagesNav.replaceChildren(...(shown.length>per?pageList(total,page):[]).map(n=>{if(n==='…')return el('span','wall-gap','…');const b=el('button');b.type='button';b.textContent=n;b.setAttribute('aria-label',`Trang ${n}`);if(n===page)b.setAttribute('aria-current','page');b.addEventListener('click',()=>go(n));return b;}));
    prev.hidden=next.hidden=shown.length<=per;prev.disabled=page<=1;next.disabled=page>=total;placeArrows();
  }
  function go(n){page=n;render();if(board.getBoundingClientRect().top<0)board.scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});}
  async function load(){
    retry.hidden=true;
    if(!cache[sort]){state('Đang tải lời nhắn…');try{const response=await fetch(`${window.POETCheckout.API_BASE}/api/donations?sort=${sort}`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const data=await response.json();cache[sort]=(Array.isArray(data.donations)?data.donations:[]).filter(d=>Number.isFinite(Number(d.amount))&&Number(d.amount)>0);if(Number.isFinite(Number(data.totalCount))){count.textContent=`${new Intl.NumberFormat('vi-VN').format(Number(data.totalCount))} lời nhắn`;count.hidden=false;}}catch{state(wall.dataset.error);retry.hidden=false;return;}}
    loaded=true;list=cache[sort];render();
  }
  prev.addEventListener('click',()=>go(page-1));next.addEventListener('click',()=>go(page+1));retry.addEventListener('click',load);
  sortButtons.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.wallSort===sort)return;sort=b.dataset.wallSort;page=1;sortButtons.forEach(x=>x.setAttribute('aria-pressed',x===b));load();}));
  let typing;search.addEventListener('input',()=>{clearTimeout(typing);typing=setTimeout(()=>{query=search.value;page=1;if(loaded)render();},150);});
  phone.addEventListener('change',()=>{page=1;if(loaded)render();});
  if('ResizeObserver'in window)new ResizeObserver(placeArrows).observe(board);
  if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!loaded){io.disconnect();load();}},{rootMargin:'200px'});io.observe(wall);}else load();

  // Composer: client-side only until TODO(UI-009-backend) lands.
  const toggle=document.querySelector('[data-wall-toggle]'),composer=document.querySelector('[data-wall-composer]');
  if(toggle&&composer){
    const form=composer.querySelector('[data-wall-form]'),label=toggle.querySelector('span:last-child'),openText=label.textContent,message=form.elements.message,countdown=form.querySelector('[data-wall-countdown]'),error=form.querySelector('[data-wall-error]'),status=form.querySelector('[data-wall-status]'),preview=form.querySelector('[data-wall-preview]'),soon=form.querySelector('[data-wall-soon]');
    const pick={paper:papers[0],glyph:glyphs[0]};
    const sync=()=>{form.querySelectorAll('[data-paper]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.paper===pick.paper));form.querySelectorAll('[data-glyph]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.glyph===pick.glyph));countdown.textContent=`${message.value.length}/280`;preview.replaceChildren(noteCard({name:form.elements.name.value.trim()||'Một nhà hảo tâm',place:form.elements.place.value.trim(),message:message.value.trim()||'Lời nhắn của bạn sẽ hiện ở đây.',paper:pick.paper,glyph:pick.glyph,when:'Vừa xong'}));};
    const setOpen=open=>{composer.classList.toggle('is-open',open);composer.inert=!open;toggle.setAttribute('aria-expanded',open);label.textContent=open?toggle.dataset.closeLabel:openText;if(open)form.elements.name.focus({preventScroll:true});else if(composer.contains(document.activeElement))toggle.focus();};
    toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
    form.addEventListener('click',e=>{const b=e.target.closest('[data-paper],[data-glyph]');if(!b)return;if(b.dataset.paper)pick.paper=b.dataset.paper;else pick.glyph=b.dataset.glyph;sync();});
    form.addEventListener('input',()=>{if(message.value.trim()){error.textContent='';message.removeAttribute('aria-invalid');}sync();});
    form.addEventListener('submit',async e=>{e.preventDefault();status.replaceChildren();
      if(!message.value.trim()){error.textContent='Bạn viết vài dòng lời nhắn trước khi dán lên tường nhé.';message.setAttribute('aria-invalid','true');message.focus();return;}
      const result=await submitWallNote({name:form.elements.name.value.trim(),place:form.elements.place.value.trim(),message:message.value.trim(),paper:pick.paper,glyph:pick.glyph});
      if(!result.ok)status.append(soon.content.cloneNode(true));});
    sync();
  }
}

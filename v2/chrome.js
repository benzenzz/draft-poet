import {contacts,socials} from './data/site-data.js?v=contacts-2';
const base=new URL('.',import.meta.url),asset=new URL('../assets/brand/poet-logo.webp',base).href;
const url=path=>new URL(path,base).href;
// Lucide icons as inline SVG drawn with currentColor: text glyphs like ↗ become emoji on iOS.
const LUCIDE={'arrow-up-right':'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'};
const arrowSvg=(name,cls='')=>`<svg${cls?` class="${cls}"`:''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LUCIDE[name]}</svg>`;
const navIcon=name=>'<span class="prototype-icon" style="--icon:url('+new URL('../assets/icons/lucide/'+name+'.svg',base).href+')" aria-hidden="true"></span>';
const navItems=[['home','', 'Trang chủ'],['team','team/','Về chúng tôi'],['du-an','du-an/','Dự án']];
class PoetNav extends HTMLElement {
  connectedCallback(){
    // Leave the approved Hero's original hidden host untouched.
    if(this.hidden||this.dataset.ready)return;
    this.dataset.ready='true';this.classList.add('site-nav');
    const current=this.getAttribute('current');
    this.innerHTML=`<nav class="site-nav-inner" aria-label="Điều hướng chính"><a class="site-wordmark" href="${url('')}" aria-label="POET, trang chủ"><img class="site-brand-symbol" src="${asset}" width="98" height="128" alt=""><span class="site-brand-letters" aria-hidden="true"><span>P</span><span>O</span><span>E</span><span>T</span></span></a><button type="button" class="site-nav-toggle" aria-expanded="false" aria-controls="site-nav-links">Menu</button><ul class="site-nav-links" id="site-nav-links">${navItems.map(([key,path,title])=>`<li><a href="${url(path)}" ${current===key?'aria-current="page"':''}>${title}</a></li>`).join('')}<li class="site-dropdown"><div class="site-dropdown-pill"><a class="site-dropdown-link" href="${url('dong-hanh/')}"><img class="site-partner-mascot" src="${new URL('../assets/mascot/be-cuc/smiling-flower-nav.png',base).href}" width="144" height="135" alt=""><span class="partner-nav-name">Đồng hành cùng POET</span></a><button type="button" class="site-dropdown-toggle" aria-label="Các cách đồng hành" title="Các cách đồng hành" aria-expanded="false" aria-controls="partner-links">${navIcon("chevron-down")}</button></div><ul class="site-dropdown-menu" id="partner-links" hidden>${[['ca-nhan','Cá nhân'],['doanh-nghiep','Doanh nghiệp'],['tinh-nguyen-vien','Tình nguyện viên']].map(([hash,title])=>`<li><a href="${url('dong-hanh/#'+hash)}">${title}</a></li>`).join('')}</ul></li></ul><a class="btn" data-donate href="${url('dong-hanh/#ca-nhan')}">${navIcon("heart")}Ủng hộ ngay</a><button class="site-nav-backdrop" type="button" aria-label="Đóng menu" tabindex="-1"></button></nav>`;
    const toggle=this.querySelector('.site-nav-toggle'),drop=this.querySelector('.site-dropdown-toggle'),menu=this.querySelector('#partner-links'),mobile=matchMedia('(max-width:900px)');
    const setDrop=open=>{drop.setAttribute('aria-expanded',String(open));menu.hidden=!open;};
    const setOpen=open=>{const wasOpen=this.classList.contains('is-open');this.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));if(!open)setDrop(false);if((mobile.matches&&open)||wasOpen){document.body.style.overflow=open?'hidden':'';document.querySelectorAll('body>main,body>poet-footer,body>.world-wrap').forEach(el=>{el.inert=open;});}};
    toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
    drop.addEventListener('click',()=>setDrop(menu.hidden));
    this.querySelector('.site-nav-backdrop').addEventListener('click',()=>{setOpen(false);toggle.focus();});
    this.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    this.addEventListener('keydown',event=>{
      if(event.key==='Escape'){const opened=toggle.getAttribute('aria-expanded')==='true';setOpen(false);if(opened)toggle.focus();else drop.focus();}
      if(event.key==='Tab'&&mobile.matches&&this.classList.contains('is-open')){
        const all=[...this.querySelectorAll('a,button')].filter(el=>el.getClientRects().length&&el.tabIndex!==-1);
        const first=all[0],last=all.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
    document.addEventListener('click',e=>{if(!this.contains(e.target))setOpen(false);});
    mobile.addEventListener('change',()=>setOpen(false));
  }
}
class PoetFooter extends HTMLElement {
  connectedCallback(){
    this.classList.add('site-footer');
    this.id='lien-he-poet';
    this.innerHTML=`<footer class="site-footer-inner"><div class="site-footer-top"><div class="site-footer-description"><div class="site-footer-brand"><img src="${asset}" width="52" height="68" alt=""><span>Câu lạc bộ Thiện&nbsp;nguyện&nbsp;POET</span></div><p>Người trẻ cùng góp sức cho cộng đồng.<br>Thành lập năm 2022 tại TP. Hồ Chí Minh.</p><a class="text-link" href="${url('team/')}">Về chúng tôi${arrowSvg('arrow-up-right','link-arrow')}</a></div><div class="site-footer-contact">${contacts.people.map(p=>`<div><small>${p.role}</small><strong>${p.name}</strong><a href="tel:${p.phone}">${p.phone}</a></div>`).join('')}<a class="site-footer-email" href="mailto:${contacts.email}">${contacts.email}</a></div><nav class="site-socials" aria-label="POET trên mạng xã hội">${socials.map(([name,href])=>`<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${name} (mở trong tab mới)"><span class="prototype-icon" style="--icon:url('${new URL('../assets/icons/social/'+name.toLowerCase()+'.svg',base).href}')" aria-hidden="true"></span></a>`).join('')}</nav></div><div class="site-footer-bottom"><span>© ${new Date().getFullYear()} Câu lạc bộ Thiện nguyện POET</span></div></footer>`;
  }
}
customElements.define('poet-nav',PoetNav);customElements.define('poet-footer',PoetFooter);

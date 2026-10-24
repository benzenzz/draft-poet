// Placement belongs to this inner SVG layer; Hero entry and idle keep their owners.
const C=Math.cos(Math.PI/6),project=(u,v)=>({x:765+(u-v)*C,y:80+(u+v)*.44-10});
const unproject=({x,y})=>({u:((x-765)/C+(y+10-80)/.44)/2,v:((y+10-80)/.44-(x-765)/C)/2});
export function initMascotDrag(hero){
  if(!hero||hero.dataset.dragReady)return;
  hero.dataset.dragReady='true';
  const events=new AbortController(),on=(el,type,fn,opts={})=>el.addEventListener(type,fn,{...opts,signal:events.signal});
  const world=hero.querySelector('.world-drift'),root=document.documentElement;
  const characters=[...hero.querySelectorAll('.flower-character')].map(el=>{
    const [u,v]=el.dataset.ground.split(' ').map(Number);
    return {el,layer:el.querySelector('.mascot-position'),body:el.querySelector('.character-body'),u,v,start:{u,v},origin:project(u,v)};
  });
  const help=document.createElement('p');help.id='mascot-drag-help';help.className='sr-only';
  help.textContent='Kéo để di chuyển trong sân. Bàn phím: Enter hoặc Space bắt đầu, phím mũi tên di chuyển, Enter xác nhận, Escape hủy.';
  const status=document.createElement('p');status.className='sr-only';status.setAttribute('role','status');hero.append(help,status);
  let active=null,ready=['alive','reduced'].includes(root.dataset.worldState),suppressClick=false;
  // Ground footprints, including the clearance around supports and access steps.
  const obstacles=[[241,317,253,432],[445,597,230,334],[421,609,460,530],[211,338,480,608],[10,140,120,430]];
  function valid(character,u,v){
    if(u<120||u>700||v<120||v>700)return false;
    if(obstacles.some(([a,b,c,d])=>u>=a&&u<=b&&v>=c&&v<=d))return false;
    const p=project(u,v);
    return characters.every(other=>other===character||Math.hypot(p.x-project(other.u,other.v).x,p.y-project(other.u,other.v).y)>=92);
  }
  function place(character,u,v){
    const from={u:character.u,v:character.v},steps=Math.min(200,Math.max(1,Math.ceil(Math.hypot(u-from.u,v-from.v)/6)));
    for(let i=1;i<=steps;i++){
      const next={u:from.u+(u-from.u)*i/steps,v:from.v+(v-from.v)*i/steps};
      if(!valid(character,next.u,next.v))break;
      character.u=next.u;character.v=next.v;
    }
    const p=project(character.u,character.v);
    character.layer.setAttribute('transform',`translate(${p.x-character.origin.x} ${p.y-character.origin.y})`);
    character.el.dataset.position=`${character.u.toFixed(2)} ${character.v.toFixed(2)}`;
    // Keep moved figures in ground-depth order without changing other objects.
    const depth=character.u+character.v;
    const next=[...world.children].find(el=>el!==character.el&&el.dataset.depth&&Number(el.dataset.depth)>depth);
    // Reparent only after the gesture: moving a captured SVG node in the DOM
    // would release pointer capture and interrupt the drag after its first step.
    if(!active){if(next)world.insertBefore(character.el,next);else world.append(character.el);}
    character.el.dataset.depth=String(depth);
  }
  function pause(character,value){
    const tweens=window.POETWorld?.ambientTimelines||[];
    for(const timeline of tweens){
      if(timeline.getChildren(true,true,false).some(t=>t.targets().includes(character.body)))value?timeline.pause():timeline.resume();
    }
  }
  function begin(character,keyboard=false){
    if(!ready||active)return false;
    active={character,keyboard,before:{u:character.u,v:character.v},moved:keyboard};
    hero.dispatchEvent(new CustomEvent('poet:mascot-drag-start'));
    pause(character,true);hero.dataset.mascotDragging='true';character.el.dataset.dragging='true';
    return true;
  }
  function end(cancel=false){
    if(!active)return;
    const {character,before,moved,id,keyboard}=active;
    active=null;
    if(cancel){character.u=before.u;character.v=before.v;place(character,before.u,before.v);}
    else place(character,character.u,character.v);
    if(id!==undefined&&character.el.hasPointerCapture(id))character.el.releasePointerCapture(id);
    delete character.el.dataset.dragging;delete hero.dataset.mascotDragging;active=null;
    pause(character,false);suppressClick=moved&&id!==undefined;
    if(keyboard)character.el.focus({preventScroll:true});
    if(moved)status.textContent=cancel?'Đã hủy di chuyển.':'Đã đặt mascot tại vị trí mới.';
  }
  const scenePoint=event=>new DOMPoint(event.clientX,event.clientY).matrixTransform(world.getScreenCTM().inverse());
  const names={'daisy-welcome':'Bé Cúc tươi vui','daisy-explorer':'Bé Cúc du lịch','daisy-juice':'Bé Cúc thưởng thức'};
  characters.forEach((character,i)=>{
    character.el.setAttribute('role','button');character.el.setAttribute('aria-label',names[character.el.dataset.obj]);character.el.setAttribute('aria-describedby',help.id);character.el.tabIndex=ready?0:-1;
    on(character.el,'pointerdown',event=>{
      if(event.button!==0||!begin(character))return;
      active.id=event.pointerId;active.pointer=scenePoint(event);active.client={x:event.clientX,y:event.clientY};active.anchor=project(character.u,character.v);
      character.el.setPointerCapture(event.pointerId);
    });
    on(character.el,'pointermove',event=>{
      if(active?.character!==character||active.id!==event.pointerId)return;
      if(!active.moved&&Math.hypot(event.clientX-active.client.x,event.clientY-active.client.y)<5)return;
      active.moved=true;const p=scenePoint(event),target=unproject({x:active.anchor.x+p.x-active.pointer.x,y:active.anchor.y+p.y-active.pointer.y});
      place(character,target.u,target.v);
    });
    on(character.el,'pointerup',()=>end());on(character.el,'pointercancel',()=>end(true));
    on(character.el,'lostpointercapture',()=>{if(active?.character===character)end();});
    on(character.el,'keydown',event=>{
      if(['Enter',' '].includes(event.key)){event.preventDefault();if(event.repeat)return;if(active?.character===character)end();else if(begin(character,true))status.textContent='Dùng phím mũi tên để di chuyển, Enter xác nhận, Escape hủy.';}
      else if(active?.character===character&&active.keyboard){
        if(event.key==='Escape'){event.preventDefault();end(true);return;}
        const delta={ArrowLeft:[-12,12],ArrowRight:[12,-12],ArrowUp:[-12,-12],ArrowDown:[12,12]}[event.key];
        if(delta){event.preventDefault();place(character,character.u+delta[0],character.v+delta[1]);}
      }
    });
  });
  on(hero,'click',event=>{if(suppressClick){suppressClick=false;if(event.target.closest?.('.flower-character')){event.preventDefault();event.stopImmediatePropagation();}}}, {capture:true});
  on(hero,'poet:hero-ready',()=>{ready=true;characters.forEach(c=>c.el.tabIndex=0);});
  on(hero,'poet:tile-assembly-start',()=>{end(true);ready=false;characters.forEach(c=>{c.el.tabIndex=-1;});});
  on(window,'blur',()=>end());on(document,'visibilitychange',()=>{if(document.hidden)end();});
  on(window,'resize',()=>end());
  on(window,'pagehide',event=>{end();if(!event.persisted){events.abort();help.remove();status.remove();delete hero.dataset.dragReady;}});
}
if(typeof document!=='undefined')initMascotDrag(document.querySelector('.hero--world'));

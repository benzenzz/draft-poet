import {createToyPiano,TILE_MELODY} from './tile-piano-audio.mjs?v=tile-piano-2';

// Sort projected geometry clockwise from the back/top corner, not SVG order.
export function orderPianoTiles(tiles){
  const points=tiles.map(tile=>{const[u,v]=tile.dataset.center.split(',').map(Number);return{tile,x:u-v,y:(u+v)*.44};});
  const cx=points.reduce((sum,p)=>sum+p.x,0)/points.length,cy=points.reduce((sum,p)=>sum+p.y,0)/points.length;
  const angle=p=>(Math.atan2(p.y-cy,p.x-cx)+Math.PI/2+2*Math.PI)%(2*Math.PI);
  return points.sort((a,b)=>angle(a)-angle(b)).map(p=>p.tile);
}

export function initTilePiano(hero){
  if(!hero||hero.dataset.pianoReady)return;
  const tiles=orderPianoTiles([...hero.querySelectorAll('.tile[data-center]')]);
  if(!tiles.length)return;
  hero.dataset.pianoReady='true';
  const events=new AbortController(),listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:events.signal});
  const root=document.documentElement,landed=new Set(),highlights=new Map(),reentries=new WeakMap();
  let assembled=['alive','reduced','fallback'].includes(root.dataset.worldState),run=null,enabled=false,attempt=0,lastTime=-Infinity,currentTile=null,focusIndex=0,touch=null,chordActive=false;
  const controls=document.createElement('div');controls.className='tile-piano-controls';
  controls.innerHTML='<button type="button" class="tile-piano-toggle" aria-pressed="false" aria-describedby="tile-piano-help"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/><path class="piano-speaker-on" d="M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/><path class="piano-speaker-off" d="m16 9 5 6m0-6-5 6"/></svg></button><p class="sr-only" id="tile-piano-help">Đường đàn POET. Bật âm rồi rê chuột hoặc chạm ô. Dùng phím mũi tên để chọn ô, Enter hoặc Space để chơi.</p><p class="tile-piano-status" role="status"></p>';
  hero.append(controls);
  const button=controls.querySelector('button'),status=controls.querySelector('[role=status]');
  function render(on){enabled=on;button.setAttribute('aria-pressed',String(on));button.title=button.ariaLabel=on?'Tắt âm thanh':'Bật âm thanh';}
  const audio=createToyPiano({onStateChange:state=>{if(state!=='running'&&enabled)stopSound();}});
  function clearHighlights(){for(const[tile,timer]of highlights){clearTimeout(timer);delete tile.dataset.pianoPlaying;}highlights.clear();}
  function stopSound(){chordActive=false;attempt++;render(false);button.disabled=false;audio.mute();clearHighlights();currentTile=null;}
  function ready(value){assembled=value;tiles.forEach((tile,i)=>tile.tabIndex=value&&i===focusIndex?0:-1);}
  function play(tile,source){
    if(!enabled||document.hidden||!audio.running)return;
    let note;
    try{note=audio.play(Number(tile.dataset.pianoMidi));}
    catch{stopSound();status.textContent='Chưa phát được âm thanh. Bạn thử bật lại nhé.';return;}
    if(!note)return;
    clearTimeout(highlights.get(tile));tile.dataset.pianoPlaying='true';
    highlights.set(tile,setTimeout(()=>{delete tile.dataset.pianoPlaying;highlights.delete(tile);},160));
    hero.dispatchEvent(new CustomEvent('poet:tile-note',{detail:{...note,tile:tile.dataset.obj,source}}));
  }
  function userNote(tile,source='pointer'){
    if(!assembled||!tile||document.hidden||root.hasAttribute('data-hero-transition'))return;
    const now=performance.now();
    if(now-lastTime<60||now-(reentries.get(tile)??-Infinity)<90)return;
    if(!enabled||!audio.running)return;
    lastTime=now;reentries.set(tile,now);play(tile,source);
  }
  const names={60:'Đô',62:'Rê',64:'Mi',67:'Sol',69:'La',72:'Đô cao'};
  tiles.forEach((tile,i)=>{
    const midi=TILE_MELODY[i%TILE_MELODY.length];
    tile.dataset.pianoIndex=String(i);tile.dataset.pianoMidi=String(midi);
    tile.setAttribute('role','button');tile.setAttribute('aria-label',`Ô nhạc ${names[midi]}, ${i+1} trên ${tiles.length}`);
    tile.setAttribute('aria-describedby','tile-piano-help');tile.tabIndex=-1;
  });
  ready(assembled);
  listen(button,'click',async()=>{
    if(enabled){stopSound();return;}
    const token=++attempt;button.disabled=true;status.textContent='';
    try{
      if(!await audio.enable())return;
      if(token!==attempt||document.hidden){audio.mute();return;}
      render(true);audio.play(60);lastTime=performance.now();
    }catch{render(false);status.textContent='Chưa bật được âm thanh. Bạn thử lại nhé.';audio.mute();}
    finally{button.disabled=false;}
  });
  const tileAt=target=>target instanceof Element&&target.matches('.tile-key-hit')?target.closest('.tile'):null;
  listen(hero,'pointerover',event=>{
    if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
    const tile=tileAt(event.target);if(tile===currentTile)return;currentTile=tile;userNote(tile);
  });
  listen(hero,'pointerout',event=>{if(tileAt(event.target)&&tileAt(event.relatedTarget)!==currentTile)currentTile=null;});
  listen(hero,'pointerdown',event=>{if(event.pointerType==='touch')touch={id:event.pointerId,x:event.clientX,y:event.clientY,tile:tileAt(event.target)};},{passive:true});
  listen(hero,'pointerup',event=>{
    if(event.pointerType!=='touch'||touch?.id!==event.pointerId)return;
    if(Math.hypot(event.clientX-touch.x,event.clientY-touch.y)<12)userNote(touch.tile);
    touch=null;
  },{passive:true});
  listen(hero,'pointercancel',()=>{touch=null;},{passive:true});
  listen(hero,'keydown',event=>{
    const tile=event.target.closest?.('.tile[data-piano-index]');if(!tile||!assembled)return;
    const index=tiles.indexOf(tile),key=event.key;
    if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(key)){
      event.preventDefault();const next=key==='Home'?0:key==='End'?tiles.length-1:(index+(['ArrowRight','ArrowDown'].includes(key)?1:-1)+tiles.length)%tiles.length;
      focusIndex=next;tiles.forEach((t,i)=>t.tabIndex=i===next?0:-1);tiles[next].focus({preventScroll:true});
    }else if(key==='Enter'||key===' '){event.preventDefault();if(!event.repeat)userNote(tile,'keyboard');}
  });
  listen(hero,'poet:tile-assembly-start',event=>{run=event.detail.run;landed.clear();ready(false);currentTile=null;clearHighlights();});
  listen(hero,'poet:tile-land',event=>{
    const {tile,run:landingRun}=event.detail;if(run===null)run=landingRun;if(run!==landingRun||landed.has(tile))return;
    landed.add(tile);play(tile,'landing');
  });
  listen(hero,'poet:tile-assembled',()=>ready(true));
  listen(hero,'poet:hero-ready',()=>ready(true));
  listen(hero,'poet:tile-assembly-cancel',()=>{run=null;ready(false);audio.hush();clearHighlights();currentTile=null;});
  listen(hero,'poet:have-fun',()=>{
    if(!enabled||!audio.running||document.hidden)return;
    chordActive=true;
    if(!audio.playChord(()=>{if(chordActive)stopSound();}))chordActive=false;
  });
  listen(document,'poet:hero-handoff',event=>{if(event.detail.phase==='start'&&!chordActive)stopSound();});
  listen(document,'visibilitychange',()=>{if(document.hidden)stopSound();});
  const observer='IntersectionObserver'in window?new IntersectionObserver(([entry])=>{if((!entry.isIntersecting||entry.intersectionRatio<.1)&&!chordActive)stopSound();},{threshold:[0,.1]}):null;observer?.observe(hero);
  function dispose(){stopSound();events.abort();observer?.disconnect();audio.dispose();controls.remove();delete hero.dataset.pianoReady;}
  listen(window,'pagehide',event=>{if(event.persisted)stopSound();else dispose();});
  render(false);
  const autoToken=++attempt;
  audio.enable({autoplay:true}).then(on=>{if(autoToken===attempt&&!document.hidden)render(!!on);}).catch(()=>{});
  return dispose;
}

if(typeof document!=='undefined')initTilePiano(document.querySelector('.hero--world'));

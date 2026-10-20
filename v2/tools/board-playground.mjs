// One shallow POET game board. All footprints share this fixed axonometric camera.
// Run node v2/tools/board-playground.mjs --write from poet to regenerate the hero only.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const W=1530,H=838,C=Math.cos(Math.PI/6),P=(u,v,z=0)=>[765+(u-v)*C,80+(u+v)*.44-z];
const n=x=>Number(x.toFixed(2)),xy=p=>P(...p).map(n).join(',');
const poly=(c,ps)=>`<polygon class="${c}" points="${ps.map(xy).join(' ')}"/>`;
const line=(c,ps,w=3)=>`<polyline class="${c}" points="${ps.map(xy).join(' ')}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle=(u,v,r,z=0,k=32)=>Array.from({length:k},(_,i)=>[u+Math.cos(i/k*Math.PI*2)*r,v+Math.sin(i/k*Math.PI*2)*r,z]);
const origin=p=>P(...p).map(n).join('px ')+'px';
const group=(c,name,p,s,attrs='')=>`<g class="${c}" data-obj="${name}" data-origin="${P(...p).map(n).join(' ')}" style="transform-origin:${origin(p)}" ${attrs}>${s}</g>`;
const rect=(a,b,c,d)=>[[a,c],[b,c],[b,d],[a,d]];
function prism(cls,fp,z,depth,cap=true){
  let s='',previous=null;const faces=[];
  fp.forEach((a,i)=>{const b=fp[(i+1)%fp.length],pa=P(...a,z),pb=P(...b,z);if(pb[0]>=pa[0]-.01){previous=null;return;}
    const face=pb[1]>pa[1]?'face-dark':'face-light';
    if(previous?.face===face)previous.points.push(b);
    else{previous={face,points:[a,b]};faces.push(previous);}
  });
  // Continuous side planes avoid hairline seams between cylinder/roundabout facets.
  for(const {face,points} of faces)s+=poly(`${cls}-side ${face}`,[...points.map(p=>[...p,z]),...points.map(p=>[...p,z-depth]).reverse()]);
  return s+(cap?poly(cls+'-top',fp.map(p=>[...p,z])):'');
}
const box=(cls,a,b,c,d,z,Z,cap=true)=>prism(cls,rect(a,b,c,d),Z,Z-z,cap);
const post=(cls,u,v,z,h,r=3)=>box(cls,u-r,u+r,v-r,v+r,z,z+h);
const contact=(u,v,r,z=1)=>poly('contact',circle(u+10,v+6,r,z));
const objects=[];
function item(kind,name,u,v,s,extra=''){
    if(name!=='join-joy-sign'){
      // A stationary silhouette receives input; only the illustration rises.
      // Keep contact shadows on the board and preserve the entrance/ambient parents.
      const shadow=s.match(/<polygon class="contact"[^>]*\/>/)?.[0]||'';
      const id='object-art-'+name;
      s=shadow+`<g class="object-hover"><g id="${id}" class="object-art">${s.replace(shadow,'')}</g></g><use class="object-hit" href="#${id}" aria-hidden="true"/>`;
      extra+=' object-target';
    }
    objects.push({depth:u+v,s:group(`build-item ${kind} ${extra}`,name,[u,v,0],s,`data-build="${kind}" data-elevation="0" data-ground="${u} ${v}" data-depth="${n(u+v)}"`)});
}
const paint=['coral','blue','yellow','green'];
function icon(kind,u,v,z,r=14,direction=1){
  if(kind==='flower'){
    let s='';for(let i=0;i<5;i++){const a=i/5*Math.PI*2;s+=poly('tile-symbol',circle(u+Math.cos(a)*r*.63,v+Math.sin(a)*r*.63,r*.44,z,12));}
    return s+poly('symbol-heart',circle(u,v,r*.3,z+.1,12));
  }
  if(kind==='arrow')return poly('tile-symbol route-arrow',[[-1,-.3],[.15,-.3],[.15,-.75],[1,0],[.15,.75],[.15,.3],[-1,.3]].map(([x,y])=>[u+x*r*direction,v+y*r*direction,z]));
  if(kind==='leaf')return poly('tile-symbol',[[u-r,v+r*.7,z],[u-r*.7,v-r*.3,z],[u,v-r,z],[u+r,v-r*.7,z],[u+r*.7,v+r*.3,z],[u,v+r,z]])+line('symbol-vein',[[u-r*.6,v+r*.45,z+.1],[u+r*.6,v-r*.45,z+.1]],1.8);
  return poly('tile-symbol',circle(u-r*.32,v-r*.3,r*.4,z,12))+poly('tile-symbol',circle(u+r*.4,v+r*.3,r*.4,z,12));
}
// A closed ring: four square corner pieces, seven fitted pieces along each side.
const route=[],ROUTE_START=24;const lo=125,hi=695,innerLo=211,innerHi=609,step=(innerHi-innerLo)/7;
function tile(a,b,c,d,u,v,kind){
  const i=route.length,color=paint[(i+Math.floor(i/8))%4],gap=1.4;
  const fp=rect(a+gap,b-gap,c+gap,d-gap),z=9;
  // Arrow corners 8 and 24 continue along +u and -u respectively.
  const glow=`<g class="tile-activation" data-origin="${P(u,v,z+.3).map(n).join(' ')}" aria-hidden="true" pointer-events="none">${poly('tile-glow-halo',fp.map(p=>[...p,z+.3]))}${poly('tile-glow-edge',fp.map(p=>[...p,z+.3]))}${poly('tile-glow-wash',rect(a+5,b-5,c+5,d-5).map(p=>[...p,z+.3]))}</g>`;
  const s=prism('path-tile',fp,z,8)+poly('tile-inset',rect(a+5,b-5,c+5,d-5).map(p=>[...p,z+.2]))+glow+icon(kind,u,v,z+.4,kind==='flower'?15:12,i===24?-1:1);
  route.push({u,v,z,order:i,footprint:{a,b,c,d}});
  objects.push({depth:-1000,s:group(`build-item tile t-${color}`,'tile-'+(i+1),[u,v,0],s,`data-build="tile" data-order="${i}" data-route-index="${(i-ROUTE_START+32)%32}" data-elevation="9" data-center="${u},${v}"`)});
}
tile(lo,innerLo,innerHi,hi,168,652,'flower');
for(let i=6;i>=0;i--)tile(lo,innerLo,innerLo+i*step,innerLo+(i+1)*step,168,innerLo+(i+.5)*step,i%3?'dots':'leaf');
tile(lo,innerLo,lo,innerLo,168,168,'arrow');
for(let i=0;i<7;i++)tile(innerLo+i*step,innerLo+(i+1)*step,lo,innerLo,innerLo+(i+.5)*step,168,i%3?'dots':'flower');
tile(innerHi,hi,lo,innerLo,652,168,'flower');
for(let i=0;i<7;i++)tile(innerHi,hi,innerLo+i*step,innerLo+(i+1)*step,652,innerLo+(i+.5)*step,i%3?'dots':'leaf');
tile(innerHi,hi,innerHi,hi,652,652,'arrow');
for(let i=6;i>=0;i--)tile(innerLo+i*step,innerLo+(i+1)*step,innerHi,hi,innerLo+(i+.5)*step,652,i%3?'dots':'flower');

// Buildings have small footprints, shallow plinths and doors/windows on both visible faces.
function building(name,u,v,w,d,h,color,roof='gable'){
  const a=u-w/2,b=u+w/2,c=v-d/2,e=v+d/2;
  let s=contact(u,v,w*.65)+box('paint-'+color,a-4,b+4,c-4,e+4,0,5)+box('house',a,b,c,e,5,h);
  // A facade band has no exposed horizontal cap inside the opaque house.
  s+=box('paint-'+color,a-1,b+1,c-1,e+1,10,19,false);
  // Front is the constant-v wall; side is constant-u. Insets remain in that wall plane.
  for(let x=a+12;x<b-10;x+=22)for(let z=35;z<h-12;z+=27){
    s+=poly('window-rim',[[x-6,e+.2,z],[x+6,e+.2,z],[x+6,e+.2,z+16],[x-6,e+.2,z+16]]);
    s+=poly('window',[[x-3.8,e+.4,z+2],[x+3.8,e+.4,z+2],[x+3.8,e+.4,z+14],[x-3.8,e+.4,z+14]]);
  }
  for(let y=c+13;y<e-9;y+=21)for(let z=35;z<h-12;z+=27)s+=poly('window',[[b+.3,y-5,z],[b+.3,y+5,z],[b+.3,y+5,z+15],[b+.3,y-5,z+15]]);
  s+=poly('door',[[u-8,e+.8,5],[u+8,e+.8,5],[u+8,e+.8,32],[u-8,e+.8,32]])+line('door-handle',[[u+3,e+1,17],[u+3,e+1,20]],2);
  if(roof==='gable'){
    s+=poly('paint-'+color+'-side face-dark',[[a-6,e+6,h],[b+6,e+6,h],[u,e+6,h+27]])+
      poly('paint-'+color+'-top',[[a-6,c-6,h],[u,c-6,h+27],[u,e+6,h+27],[a-6,e+6,h]])+
      poly('paint-'+color+'-side face-light',[[u,c-6,h+27],[b+6,c-6,h],[b+6,e+6,h],[u,e+6,h+27]]);
  }else{
    s+=box('paint-'+color,a-5,b+5,c-5,e+5,h,h+8)+poly('roof-inset',rect(a+3,b-3,c+3,e-3).map(p=>[...p,h+8.2]));
    s+=icon('flower',u,v,h+9,16);
  }
  // Tiny book emblem for the school, instead of invented headline copy.
  if(name==='school')s+=poly('book-left',[[u-16,e+1,h-7],[u,e+1,h-10],[u,e+1,h-28],[u-16,e+1,h-25]])+poly('book-right',[[u,e+1,h-10],[u+16,e+1,h-7],[u+16,e+1,h-25],[u,e+1,h-28]]);
  item('building',name,u,v,s,'t-'+color);
}
building('school',100,55,100,70,85,'coral');
building('clubhouse',405,53,78,68,77,'yellow','flat');
building('creative-workshop',746,120,74,70,68,'blue');
building('community-center',51,365,70,96,82,'green','flat');
building('art-house',766,465,68,74,65,'coral','flat');
building('little-library',275,766,74,65,54,'blue');

function slide(){
  const u=280,v=320,z=95;let s=contact(u+24,v+40,60);
  // Paint rear access before the opaque deck, then the near supports/chute.
  // Drawing the ladder last made its upper rungs cut across the deck's front face.
  let ladder='';
  for(let i=0;i<5;i++)ladder+=line('ladder-rung',[[u-23,v-69+i*9,7+i*17],[u+23,v-69+i*9,7+i*17]],4);
  for(const x of [u-25,u+25])ladder+=line('frame-green',[[x,v-76,0],[x,v-31,z]],4);
  s+=`<g class="slide-rear-access">${ladder}</g>`;
  for(const x of [u-29,u+29])s+=post('paint-yellow',x,v-26,0,z+27,3.4);
  s+=`<g class="slide-deck">${box('paint-green',u-34,u+34,v-31,v+31,z-7,z)}</g>`;
  for(const x of [u-29,u+29])s+=post('paint-yellow',x,v+26,0,z+27,3.4);
  const run=Array.from({length:20},(_,i)=>{const t=i/19;return[u,v+28+t*116,z-89*(.5-.5*Math.cos(t*Math.PI))];});
  s+=poly('paint-blue-top',[...run.map(([u,v,z])=>[u-20,v,z]),...run.map(([u,v,z])=>[u+20,v,z]).reverse()]);
  s+=poly('paint-blue-side face-dark',[...run.map(([u,v,z])=>[u+20,v,z]),...run.map(([u,v,z])=>[u+20,v,z+8]).reverse()])+line('slide-rail',run.map(([u,v,z])=>[u-20,v,z+7]),4);
  const peak=[u,v,z+80];s+=poly('paint-coral-top',[[u-42,v-40,z+44],peak,[u-42,v+40,z+44]])+poly('paint-coral-side face-light',[peak,[u+42,v-40,z+44],[u+42,v+40,z+44],[u-42,v+40,z+44]]);
  item('equipment','slide',u,v+45,s);
}
function swing(){
  const u=520,v=285,z=128;let s=contact(u,v,70);
  for(const x of [u-62,u+62])s+=line('frame-green',[[x,v-34,0],[x,v,z],[x,v+34,0]],7);
  s+=box('paint-coral',u-70,u+70,v-5,v+5,z-4,z+4);
  const seat=line('rope',[[u-17,v,z-5],[u-17,v,28]],2)+line('rope',[[u+17,v,z-5],[u+17,v,28]],2)+box('paint-yellow',u-25,u+25,v-14,v+14,20,28);
  s+=group('swing-seat','swing-seat',[u,v,z-5],seat);
  item('equipment','swing',u,v,s);
}
function seesaw(){
  const u=515,v=495,z=28;let s=contact(u,v,67)+poly('paint-blue-side face-dark',[[u-18,v+13,0],[u+18,v+13,0],[u,v+13,z]])+poly('paint-blue-top',[[u,v-13,z],[u,v+13,z],[u+18,v+13,0],[u+18,v-13,0]]);
  let plank=poly('paint-yellow-top',[[u-72,v-13,z-12],[u+72,v-13,z+12],[u+72,v+13,z+12],[u-72,v+13,z-12]])+poly('paint-yellow-side face-dark',[[u-72,v+13,z-12],[u+72,v+13,z+12],[u+72,v+13,z+5],[u-72,v+13,z-19]]);
  for(const [x,h]of[[u-51,z-9],[u+51,z+9]])plank+=post('paint-coral',x,v,h,23,2)+line('frame-coral',[[x,v-10,h+23],[x,v+10,h+23]],4);
  s+=group('seesaw-plank','seesaw-plank',[u,v,z],plank);
  item('equipment','seesaw',u,v,s);
}
function carousel(){
  const u=275,v=550;let s=contact(u,v,57)+prism('paint-green',circle(u,v,51).map(p=>p.slice(0,2)),12,9)+poly('paint-yellow-top',circle(u,v,33,12.2));
  for(const a of [.3,1.9,3.45,5]){const x=u+Math.cos(a)*37,y=v+Math.sin(a)*37;s+=post('paint-coral',x,y,12,32,2.5)+line('frame-coral',[[x,y,44],[u,v,44]],4);}
  s+=post('paint-blue',u,v,12,38,3.5);item('equipment','roundabout',u,v,s);
}
slide();swing();seesaw();carousel();

function tree(name,u,v,size=1){
  const[x,y]=P(u,v,65*size),r=25*size;
  let s=contact(u,v,r)+post('paint-green',u,v,0,62*size,3*size);
  // Preserve the approved rounded silhouette; replace only its malformed, detached shade.
  const crown=`M${n(x-r)} ${n(y+10)}c${-r} -5 ${-r} -33 0 -34 -2 -24 34 -31 43 -9 27 -1 34 35 10 42Z`,a=x-r;
  s+=`<g class="tree-canopy"><defs><clipPath id="canopy-${name}"><path d="${crown}"/></clipPath></defs><path class="tree-crown" d="${crown}"/><path class="tree-shade" clip-path="url(#canopy-${name})" d="M${n(a-20)} ${n(y-5)}C${n(a+3)} ${n(y+5)} ${n(a+27)} ${n(y+8)} ${n(a+49)} ${n(y-3)}C${n(a+62)} ${n(y-10)} ${n(a+70)} ${n(y-17)} ${n(a+75)} ${n(y-22)}L${n(a+85)} ${n(y+26)}H${n(a-22)}Z"/></g>`;
  item('vegetation',name,u,v,s);
}
function flowers(u,v){
  let s=box('planter',u-15,u+37,v-12,v+13,0,7);
  for(let i=0;i<3;i++){const[x,y]=P(u+i*13,v,25+i%2*8);s+=`<path class="flower-stem" d="M${n(x)} ${n(y+18)}v-18"/>`;for(let j=0;j<5;j++){const a=j/5*Math.PI*2;s+=`<circle class="flower-petal" cx="${n(x+Math.cos(a)*4.2)}" cy="${n(y+Math.sin(a)*4.2)}" r="3.3"/>`;}s+=`<circle class="flower-heart" cx="${n(x)}" cy="${n(y)}" r="2.8"/>`;}
  item('vegetation','flowers-'+u+'-'+v,u+10,v,group('flower-sway','flower-stems',[u+10,v,6],s));
}
function bush(u,v){let s=contact(u,v,24);for(const [x,y,z,r]of[[u-14,v,14,15],[u,v,22,19],[u+16,v,13,14]])s+=prism('bush',circle(x,y,r).map(p=>p.slice(0,2)),z,z-1);item('vegetation','bush-'+u+'-'+v,u,v,s);}
function lamp(u,v){const[x,y]=P(u,v,81);item('prop','lamp-'+u+'-'+v,u,v,contact(u,v,12)+prism('paint-blue',circle(u,v,10).map(p=>p.slice(0,2)),5,4)+post('paint-green',u,v,4,74,2)+`<circle class="lamp-globe" cx="${n(x)}" cy="${n(y)}" r="9"/>`);}
function bench(u,v,outward=false){
  let s=contact(u,v,32);
  if(outward){
    // Long axis follows the right board edge; open seat faces +u, away from the tree.
    for(const y of [v-25,v+25])s+=post('paint-blue',u,y,0,17,2.5);
    s+=box('paint-green',u-15,u-11,v-34,v+34,21,42)+box('paint-yellow',u-12,u+12,v-34,v+34,16,21);
  }else{
    for(const x of [u-25,u+25])s+=post('paint-blue',x,v,0,17,2.5);
    s+=box('paint-yellow',u-34,u+34,v-12,v+12,16,21)+box('paint-green',u-34,u+34,v-15,v-11,21,42);
  }
  item('prop','bench-'+u+'-'+v,u,v,s);
}
function fence(u,v,len){let s='';for(let x=0;x<=len;x+=23)s+=post('paint-blue',u+x,v,0,25,2);for(const z of [10,21])s+=line('fence-rail',[[u,v,z],[u+len,v,z]],3);item('prop','fence-'+u+'-'+v,u+len/2,v,s);}
function sign(u,v,type='arrow'){
  let s=contact(u,v,15)+post('paint-yellow',u,v,0,57,3);
  const a=u-26,b=u+26,z=57;
  if(type==='logo'){
    s+=poly('sign-face',[[a,v,z-13],[b,v,z-13],[b+10,v,z],[b,v,z+13],[a,v,z+13]]);
    const[x,y]=P(u-21,v,z+11);
    s+=`<image href="../assets/brand/poet-logo.webp" x="0" y="0" width="42" height="23" preserveAspectRatio="xMidYMid meet" transform="matrix(${C} .44 0 1 ${n(x)} ${n(y)})"/>`;
  }else{
    const near=route.reduce((best,p)=>Math.hypot(p.u-u,p.v-v)<Math.hypot(best.u-u,best.v-v)?p:best),next=route[(near.order+1)%route.length];
    const length=Math.hypot(next.u-near.u,next.v-near.v),du=(next.u-near.u)/length,dv=(next.v-near.v)/length;
    const point=(offset,height)=>[u+du*offset,v+dv*offset,height];
    s+=poly('sign-face',[point(-26,z-13),point(26,z-13),point(36,z),point(26,z+13),point(-26,z+13)]);
    s+=poly('sign-arrow',[point(-13,z-2),point(4,z-2),point(4,z-7),point(13,z),point(4,z+7),point(4,z+2),point(-13,z+2)]);
  }
  item('prop','sign-'+type+'-'+u,u,v,s);
}
function flag(u,v,color){item('prop','flag-'+u,u,v,post('paint-blue',u,v,0,61,2)+poly('paint-'+color+'-top',[[u,v,62],[u+28,v,57],[u+23,v,40],[u,v,44]]));}
function joinJoySign(u,v){
  // Small park wayfinder in the open left perimeter strip, pointing toward the foreground.
  const point=(offset,z,back=0)=>[u+back,v-offset,z];
  const face=(cls,back)=>poly(cls,[point(-50,45,back),point(57,45,back),point(57,85,back),point(-50,85,back),point(-65,65,back)]);
  let s=`<g class="join-joy-aura" aria-hidden="true" pointer-events="none">${face('join-joy-halo',0)}${face('join-joy-rim',0)}</g>`+face('join-joy-edge',3)+face('join-joy-face',0);
  const[x,y]=P(u,v+32,61);
  s+=`<g transform="matrix(${C} -.44 0 1 ${n(x)} ${n(y)})"><text class="join-joy-lettering" x="0" y="0"><tspan>Join</tspan> <tspan dx="1">Joy</tspan></text><path class="join-joy-arrow" d="M-8-4h-13m5-5-5 5 5 5"/></g>`;
  s+=`<title>Join Joy — next destination</title>`;
  const[ox,oy]=P(u,v,0).map(n);
  const attachment=P(u,v,60).map(n).join(' ');
  const corners=[point(-50,45),point(57,45),point(57,85),point(-50,85),point(-65,65)].map(p=>P(...p)),xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
  const hit=`<rect class="join-joy-hit" x="${n(Math.min(...xs)-14)}" y="${n(Math.min(...ys)-14)}" width="${n(Math.max(...xs)-Math.min(...xs)+28)}" height="${n(Math.max(...ys)-Math.min(...ys)+28)}" fill="transparent"/>`;
  item('prop','join-joy-sign',u,v,`<g class="join-joy-size" transform="translate(${ox} ${oy}) scale(1.35) translate(${-ox} ${-oy})"><a class="join-joy-link" href="#noi-dung" aria-label="Join Joy — khám phá câu chuyện POET" tabindex="0">${hit}<g class="join-joy-invite"><g class="join-joy-hover" data-origin="${attachment}">${s}</g></g></a></g>`);
  // Aim at the actual middle of the upper face edge, including the sign's 1.35 scale.
  // The former freehand endpoint stopped above its far corner and looked detached.
  const a=P(...point(-50,85)).map(n),b=P(...point(57,85)).map(n);
  const tx=n(ox+((a[0]+b[0])/2-ox)*1.35),ty=n(oy+((a[1]+b[1])/2-oy)*1.35);
  const xTip=tx,yTip=n(ty-8),pt=(dx,dy)=>`${n(xTip+dx)} ${n(yTip+dy)}`;
  // Exterior root-SVG coordinates; share the sign's float/drift parents.
  return `<g class="join-joy-cue" aria-hidden="true" data-target="join-joy-sign"><path class="cue-line" d="M${pt(-160,28)}C${pt(-194,-52)} ${pt(-157,-103)} ${pt(-88,-97)}C${pt(-44,-92)} ${pt(-14,-42)} ${pt(0,0)}"/><path class="cue-head" d="M${pt(-11,-10)}Q${pt(-5,-8)} ${pt(0,0)}L${pt(2,-14)}"/></g>`;
}
function parkSign(u,v){
  // Landscape Young Joy sign: reuse the official lettering on the same rear-edge plane.
  let s='';
  for(const x of [u-82,u+82]){
    s+=post('paint-green',x,v+3,0,116,3.5);
    s+=box('paint-yellow',x-4,x+4,v-1,v+7,15,24);
  }
  const face=(cls,pad=0,shift=0)=>{
    const[x,y]=P(u-135+pad,v+shift,250-pad),r=14-pad;
    return `<rect class="${cls}" x="0" y="0" width="${270-pad*2}" height="${150-pad*2}" rx="${r}" ry="${r}" transform="matrix(${C} .44 0 1 ${n(x)} ${n(y)})"/>`;
  };
  s+=face('park-sign-edge',0,6);
  s+=face('park-sign-frame');
  s+=face('park-sign-face',5);
  // Existing approved transparent derivative preserves the custom letter shapes and accents.
  const[x,y]=P(u-117,v-.3,233);
  s+=`<image class="park-sign-lettering" href="../assets/season-6/lettering/dan-choi-young-joy.webp" x="0" y="0" width="234" height="116" preserveAspectRatio="xMidYMid meet" transform="matrix(${C} .44 0 1 ${n(x)} ${n(y)})"/>`;
  s+=line('park-sign-accent',[[u-123,v-.5,238],[u-105,v-.5,238]],3);
  for(const [x,z]of[[u-122,114],[u+122,237]]){
    const[cx,cy]=P(x,v-.5,z);s+=`<circle class="park-sign-pin" cx="${n(cx)}" cy="${n(cy)}" r="2.1"/>`;
  }
  s=`<title>(dân) YOUNG — (chơi) JOY</title>${s}`;
  item('prop','park-sign',u,v,s);
}
function figure(name,file,iw,ih,u,v,Z,extra=''){
  const[x,y]=P(u,v,10),w=Z*iw/ih;
  item('character',name,u,v,contact(u,v,17,9)+`<g class="character-body" data-origin="${P(u,v,10).map(n).join(' ')}" style="transform-origin:${origin([u,v,10])}"><image href="../assets/mascot/be-cuc/${file}.webp" x="${n(x-w/2)}" y="${n(y-Z)}" width="${n(w)}" height="${Z}"/></g>`,extra);
}
tree('school-tree',235,56,.8);tree('workshop-tree',770,280,.85);tree('east-tree',770,675,.85);tree('front-tree',555,770,.85);
for(const p of [[555,48],[764,365],[430,770]])flowers(...p);
for(const p of [[50,490],[720,775]])bush(...p);
for(const p of [[565,106],[716,560]])lamp(...p);
bench(760,590,true);bench(105,770);
const cue=joinJoySign(48,620);
fence(440,792,69);
parkSign(565,-15);sign(736,190);flag(485,52,'coral');
// Keep the walking lane clear; these two figures stand just inside the route.
figure('daisy-explorer','du-lich',239,200,360,600,55,'npc');
figure('daisy-juice','enjoy',183,200,574,390,57);
figure('daisy-welcome','vui-tuoi',180,200,110,505,58);
// Central graphic marks use the same plane as the board, rather than separate platforms.
let playSurface=poly('play-area',rect(220,600,220,600).map(p=>[...p,.2]));
playSurface+=line('play-border',[[225,225,.3],[595,225,.3],[595,595,.3],[225,595,.3],[225,225,.3]],2);
for(let i=0;i<4;i++)playSurface+=poly('hopscotch',rect(385,409,415+i*26,438+i*26).map(p=>[...p,.4]));
playSurface+=icon('flower',400,365,.4,20);
// A rounded rectangle in board coordinates, projected through the SAME camera.
// Every Q shares its exact endpoint with the top and extruded side paths.
const pathPoint=(u,v,z=0)=>P(u,v,z).map(n).join(' ');
function roundedOutline(a,b,c,d,r,z=0){
  return `M${pathPoint(a+r,c,z)}L${pathPoint(b-r,c,z)}Q${pathPoint(b,c,z)} ${pathPoint(b,c+r,z)}L${pathPoint(b,d-r,z)}Q${pathPoint(b,d,z)} ${pathPoint(b-r,d,z)}L${pathPoint(a+r,d,z)}Q${pathPoint(a,d,z)} ${pathPoint(a,d-r,z)}L${pathPoint(a,c+r,z)}Q${pathPoint(a,c,z)} ${pathPoint(a+r,c,z)}Z`;
}
const radius=48;
// Visible boundary starts/ends at the x-extrema of the two side corner curves.
const right=P(820-radius/4,radius/4),left=P(radius/4,820-radius/4);
const shifted=(p,z)=>[p[0],p[1]-z].map(n).join(' ');
// Split the near rounded corner at its midpoint, with one continuous shared edge.
const middle=P(820-radius/4,820-radius/4);
const side=`<path class="board-side face-light" d="M${shifted(middle,0)}Q${pathPoint(820-radius/2,820)} ${pathPoint(820-radius,820)}L${pathPoint(radius,820)}Q${pathPoint(radius/2,820)} ${shifted(left,0)}L${shifted(left,-14)}Q${pathPoint(radius/2,820,-14)} ${pathPoint(radius,820,-14)}L${pathPoint(820-radius,820,-14)}Q${pathPoint(820-radius/2,820,-14)} ${shifted(middle,-14)}Z"/>`;
const dark=`<path class="board-side face-dark" d="M${shifted(right,0)}Q${pathPoint(820,radius/2)} ${pathPoint(820,radius)}L${pathPoint(820,820-radius)}Q${pathPoint(820,820-radius/2)} ${shifted(middle,0)}L${shifted(middle,-14)}Q${pathPoint(820,820-radius/2,-14)} ${pathPoint(820,820-radius,-14)}L${pathPoint(820,radius,-14)}Q${pathPoint(820,radius/2,-14)} ${shifted(right,-14)}Z"/>`;
const board=group('build-item board','single-board',[410,410,-14],side+dark+`<path class="board-top" d="${roundedOutline(0,820,0,820,radius)}"/><path class="board-rim" d="${roundedOutline(8,812,8,812,radius-8,.1)}"/>`+playSurface,'data-build="board" data-elevation="0" data-thickness="14" data-corner-radius="48"');
const shadow=`<path class="board-shadow" d="${roundedOutline(12,827,12,827,radius,-22)}"/>`;
const mark='<g class="intro-mark" aria-hidden="true"><image class="intro-primary-logo" href="../assets/brand/poet-primary-intro.webp" x="723" y="335" width="84" height="110" preserveAspectRatio="xMidYMid meet"/></g>';
const walkRoute=[...route.slice(ROUTE_START),...route.slice(0,ROUTE_START)],walkStops=walkRoute.map(p=>P(p.u,p.v,10).map(n));
const walkPath=`<path id="poet-mascot-route" d="${[...walkStops,walkStops[0]].map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}" fill="none" stroke="none" pointer-events="none" data-start-x="${walkStops[0][0]}" data-start-y="${walkStops[0][1]}" data-tile-orders="${walkRoute.map(p=>p.order).join(',')}"/>`;
// The same official standing artwork, at exactly its previous 5.2%-of-stage size.
const[mx,my]=P(652,652,10),anchor={x:n(mx/W*100),y:n(my/H*100)};
const mw=W*.052,mh=mw*400/310;
objects.push({depth:1304,s:group('build-item main-mascot object-target','be-mam',[652,652,10],`<g class="object-hover"><g class="object-art" id="object-art-be-mam"><g class="main-mascot-body" data-origin="${n(mx)} ${n(my)}"><image href="../assets/mascot/be-mam/stand.webp" x="${n(mx-mw/2)}" y="${n(my-mh)}" width="${n(mw)}" height="${n(mh)}"/></g></g></g><use class="object-hit" href="#object-art-be-mam" aria-hidden="true"/>`,'data-build="mascot" data-depth="1304" data-current-tile="24"')});
const windLayer=(layer,ids)=>`<g class="wind-layer wind-${layer}" aria-hidden="true" pointer-events="none">${ids.map(i=>`<g class="wind-leaf" data-leaf="${i}" opacity="0"><g class="leaf-shape"><path class="leaf-fill" d="M-8 0Q-3-8 8 0Q3 8-8 0Z"/><path class="leaf-vein" d="M-5 0H5"/></g></g>`).join('')}</g>`;
const svg=`<svg class="playground" viewBox="0 0 ${W} ${H}" role="group" aria-label="Thế giới sân chơi POET" focusable="false">\n${walkPath}\n${windLayer('back',[0,1])}\n<g class="world-float"><g class="world-drift">${shadow}\n${board}\n${objects.sort((a,b)=>a.depth-b.depth).map(o=>o.s).join('\n')}\n${cue}</g></g>\n${windLayer('front',[2,3])}\n${mark}\n</svg>`;
if(route.length!==32||route.some(p=>p.z!==9))throw new Error('Route must contain 32 equal-elevation pieces');
for(let i=0;i<route.length;i++){
  const a=route[i].footprint,b=route[(i+1)%route.length].footprint;
  const touches=(Math.abs(a.a-b.b)<.01||Math.abs(a.b-b.a)<.01)&&Math.min(a.d,b.d)>Math.max(a.c,b.c)||
    (Math.abs(a.c-b.d)<.01||Math.abs(a.d-b.c)<.01)&&Math.min(a.b,b.b)>Math.max(a.a,b.a);
  if(!touches)throw new Error('Open route between '+i+' and '+((i+1)%route.length));
}
if(process.argv.includes('--write')){
  const file=fileURLToPath(new URL('../index.html',import.meta.url));let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<svg class="playground"[\s\S]*?<\/svg>/,svg).replace(/(<div class="mascot" style=")[^"]*(")/,`$1--x: ${anchor.x}%; --y: ${anchor.y}%$2`)
    .replace(/\s*<div class="mascot"[^>]*>[\s\S]*?<\/div>/,'')
    .replace('A connected route through four floating playground terraces. No hero copy.','One flat POET game board, a closed colorful route and a miniature playground. No hero copy.');
  fs.writeFileSync(file,html);
  console.log(JSON.stringify({written:'v2/index.html',board:1,thickness:14,tiles:route.length,closedRoute:true,buildings:6,equipment:4,mascot:anchor}));
}else console.log(svg);

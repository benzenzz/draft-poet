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
const contact=(u,v,r,z=1)=>poly('contact',circle(u+10,v+6,r,z)).replace('class="contact"','class="contact" data-round-shadow');
const objects=[];
const boardPoly=poly,boardLine=line;
function item(kind,name,u,v,s,extra=''){
    if(name!=='have-fun-sign'){
      // A stationary silhouette receives input; only the illustration rises.
      // Keep contact shadows on the board and preserve the entrance/ambient parents.
      const shadow=s.match(/<polygon class="contact"[^>]*\/>/)?.[0]||'';
      const id='object-art-'+name;
      const hit=kind==='character'?'flower-image-'+name:id;
      s=shadow+`<g class="object-hover"><g id="${id}" class="object-art">${s.replace(shadow,'')}</g></g><use class="object-hit" href="#${hit}" aria-hidden="true"/>`;
      extra+=' object-target';
    }
    if(name==='slide'||name==='swing'){
      const [x,y]=P(u,v,0),size=name==='slide'?.7:.85;
      s=`<g class="equipment-size" transform="translate(${n(x)} ${n(y)}) scale(${size}) translate(${-n(x)} ${-n(y)})">${s}</g>`;
    }
    if(kind==='character')s=`<g class="mascot-position">${s}</g>`;
    // Static mounting height is separate from the entry/hover transforms.
    const elevation=kind.includes('building')||name.startsWith('meadow-')||name.startsWith('flowers-')?9:0;
    if(elevation)s=`<g class="tile-mounted" transform="translate(0 -${elevation})">${s}</g>`;
    const onEdge=Math.min(u,v)<103||Math.max(u,v)>717;
    const footprint=name==='school'?{du:GRID.cell*.4,dv:GRID.cell*1.43}:kind.includes('building')?{du:GRID.cell*.88,dv:GRID.cell*.35}:null;
    const supports=footprint?route.filter(t=>t.footprint.a<u+footprint.du&&t.footprint.b>u-footprint.du&&t.footprint.c<v+footprint.dv&&t.footprint.d>v-footprint.dv):onEdge?[route.reduce((a,b)=>Math.hypot(a.u-u,a.v-v)<Math.hypot(b.u-u,b.v-v)?a:b)]:[];
    const supportAttr=supports.length?` data-support-tiles="${supports.map(t=>'tile-'+(t.order+1)).join(' ')}"`:'';
    objects.push({depth:u+v,s:group(`build-item ${kind} ${extra}`,name,[u,v,elevation],s,`data-build="${kind}" data-elevation="${elevation}" data-ground="${u} ${v}" data-depth="${n(u+v)}"${supportAttr}`)});
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
// Nine shared cells per side: 32 equal perimeter cells, including four corners.
const GRID=Object.freeze({cells:9,cell:88,offset:14});
const route=[],ROUTE_START=24;
const lo=GRID.offset,hi=lo+GRID.cells*GRID.cell,innerLo=lo+GRID.cell,innerHi=hi-GRID.cell,step=GRID.cell;
const near=lo+GRID.cell/2,far=hi-GRID.cell/2;
// Board-corner pieces round only their outermost vertex, concentric with the board's
// 48-unit corner and drawn with the same quadratic as roundedOutline(). Shared edges stay straight.
const BOARD=820,BOARD_RADIUS=48;
function roundOuter(fp){
  const i=fp.reduce((best,p,j)=>Math.hypot(p[0]-410,p[1]-410)>Math.hypot(fp[best][0]-410,fp[best][1]-410)?j:best,0);
  const p=fp[i],q=fp[(i+fp.length-1)%fp.length],s=fp[(i+1)%fp.length],r=BOARD_RADIUS-Math.min(p[0],BOARD-p[0]);
  const unit=t=>{const l=Math.hypot(t[0]-p[0],t[1]-p[1]);return[(t[0]-p[0])/l,(t[1]-p[1])/l];},a=unit(q),b=unit(s);
  const start=[p[0]+a[0]*r,p[1]+a[1]*r],end=[p[0]+b[0]*r,p[1]+b[1]*r];
  const curve=Array.from({length:11},(_,j)=>{const t=j/10,k=(1-t)**2,m=2*t*(1-t),w=t*t;return[k*start[0]+m*p[0]+w*end[0],k*start[1]+m*p[1]+w*end[1]];});
  return[...fp.slice(0,i),...curve,...fp.slice(i+1)];
}
function tile(a,b,c,d,u,v,kind,corner=false){
  const i=route.length,color=paint[(i+Math.floor(i/8))%4],gap=1.4,shape=corner?roundOuter:fp=>fp;
  const fp=shape(rect(a+gap,b-gap,c+gap,d-gap)),inset=shape(rect(a+5,b-5,c+5,d-5)),z=9;
  // Arrow corners 8 and 24 continue along +u and -u respectively.
  const glow=`<g class="tile-activation" data-origin="${P(u,v,z+.3).map(n).join(' ')}" aria-hidden="true" pointer-events="none">${poly('tile-glow-halo',fp.map(p=>[...p,z+.3]))}${poly('tile-glow-edge',fp.map(p=>[...p,z+.3]))}${poly('tile-glow-wash',inset.map(p=>[...p,z+.3]))}</g>`;
  const s=prism('path-tile',fp,z,8)+poly('tile-inset',inset.map(p=>[...p,z+.2]))+glow+icon(kind,u,v,z+.4,kind==='flower'?15:12,i===24?-1:1)+poly('tile-key-hit',fp.map(p=>[...p,z]));
  route.push({u,v,z,order:i,footprint:{a,b,c,d}});
  objects.push({depth:-1000,s:group(`build-item tile t-${color}`,'tile-'+(i+1),[u,v,0],s,`data-build="tile" data-order="${i}" data-route-index="${(i-ROUTE_START+32)%32}" data-elevation="9" data-center="${u},${v}"`)});
}
tile(lo,innerLo,innerHi,hi,near,far,'flower',true);
for(let i=6;i>=0;i--)tile(lo,innerLo,innerLo+i*step,innerLo+(i+1)*step,near,innerLo+(i+.5)*step,i%3?'dots':'leaf');
tile(lo,innerLo,lo,innerLo,near,near,'arrow',true);
for(let i=0;i<7;i++)tile(innerLo+i*step,innerLo+(i+1)*step,lo,innerLo,innerLo+(i+.5)*step,near,i%3?'dots':'flower');
tile(innerHi,hi,lo,innerLo,far,near,'flower',true);
for(let i=0;i<7;i++)tile(innerHi,hi,innerLo+i*step,innerLo+(i+1)*step,far,innerLo+(i+.5)*step,i%3?'dots':'leaf');
tile(innerHi,hi,innerHi,hi,far,far,'arrow',true);
for(let i=6;i>=0;i--)tile(innerLo+i*step,innerLo+(i+1)*step,innerHi,hi,innerLo+(i+.5)*step,far,i%3?'dots':'flower');

// Buildings have small footprints, shallow plinths and doors/windows on both visible faces.
function building(name,u,v,w,d,h,color,roof='gable'){
  // Rotate the geometry in the board plane; no mirrored SVG/text transform.
  const turn=([x,y,z])=>[u+y-v,v-x+u,z];
  const poly=(cls,points)=>boardPoly(cls,points.map(turn));
  const line=(cls,points,width)=>boardLine(cls,points.map(turn),width);
  const box=(cls,a,b,c,d,z,Z,cap=true)=>prism(cls,rect(a,b,c,d).map(p=>turn([...p,0]).slice(0,2)),Z,Z-z,cap);
  const a=u-w/2,b=u+w/2,c=v-d/2,e=v+d/2;
  const H=61,front=e+15,ridge=v-5;
  let s=poly('contact',rect(a-5,b+8,c-4,front+18).map(p=>[...p,1]));
  s+=box('school-step',a-7,b+7,e-3,front+20,0,3)+box('school-step',a-5,b+5,e-3,front+13,3,6);
  s+=box('school-wall',a,b,c,e,6,H);
  for(let i=0;i<4;i++){
    const x=a+7+i*w/4,bay=w/4-14;
    s+=poly('school-door',[[x,e+.3,7],[x+bay,e+.3,7],[x+bay,e+.3,46],[x,e+.3,46]]);
    for(let j=0;j<4;j++)s+=poly('school-vent',[[x+j*bay/4,e+.4,50],[x+j*bay/4+bay/5,e+.4,50],[x+j*bay/4+bay/5,e+.4,54],[x+j*bay/4,e+.4,54]]);
    s+=line('school-door-seam',[[x+bay/2,e+.7,8],[x+bay/2,e+.7,45]],.9);
  }
  const point=(x,z)=>P(...turn([x,e+.8,z])).map(n).join(' ');
  const wave=(cls,z,offset)=>`<path class="school-mural ${cls}" d="M${point(a,7)}L${point(a,z)}C${point(a+w*.25,z+offset)} ${point(a+w*.33,z-offset)} ${point(a+w*.5,z)}S${point(a+w*.8,z+offset)} ${point(b,z-2)}L${point(b,7)}Z"/>`;
  s+=wave('mural-coral',28,10)+wave('mural-yellow',22,-7)+wave('mural-teal',16,8)+wave('mural-blue',10,-5);
  for(const x of[a+w*.2,a+w*.73]){
    for(let j=0;j<5;j++){
      const angle=j/5*Math.PI*2;
      s+=poly('school-petal',Array.from({length:10},(_,k)=>[x+Math.cos(angle)*4+Math.cos(k/10*Math.PI*2)*2.5,e+1,21+Math.sin(angle)*4+Math.sin(k/10*Math.PI*2)*2.5]));
    }
    s+=poly('school-flower-center',Array.from({length:12},(_,k)=>[x+Math.cos(k/12*Math.PI*2)*2,e+1.2,21+Math.sin(k/12*Math.PI*2)*2]));
  }
  s+=box('school-porch',a-3,b+3,e,front+5,6,8);
  for(let i=0;i<=4;i++)s+=box('school-column',a+i*w/4-2,a+i*w/4+2,front-2,front+2,8,H);
  s+=box('school-column',a-2,b+2,front-1,front+2,H-5,H);
  s+=poly('school-roof-back',[[a-6,c-7,H],[b+6,c-7,H],[b+6,ridge,H+19],[a-6,ridge,H+19]]);
  s+=poly('school-roof-front',[[a-6,ridge,H+19],[b+6,ridge,H+19],[b+6,front+8,H],[a-6,front+8,H]]);
  s+=line('school-eave',[[a-6,front+8,H],[b+6,front+8,H]],2);
  item('building',name,u,v,s,'t-'+color);
}
building('school',near,lo+GRID.cell*3,GRID.cell*2.85,GRID.cell*.70,65,'coral');

// A two-cell footprint on each remaining edge. Facades face the playground.
function stall(name,u,v,edge,color,label,variant){
  if(variant!=='awning')return serviceStall(name,u,v,edge,label,variant);
  const w=GRID.cell*1.72,d=GRID.cell*.63,h=57;
  const at=(x,y,z)=>edge==='left'?[u+y,v+x,z]:edge==='right'?[u-y,v-x,z]:edge==='top'?[u+x,v+y,z]:[u+x,v-y,z];
  const panel=(cls,points)=>poly(cls,points.map(p=>at(...p)));
  const wall=(cls,a,b,c,e,z,Z)=>panel(cls,[[a,e,z],[b,e,z],[b,e,Z],[a,e,Z]]);
  let art=contact(u,v,GRID.cell*.62);
  art+=panel('paint-'+color+'-top',[[-w/2,-d/2,3],[w/2,-d/2,3],[w/2,d/2,3],[-w/2,d/2,3]]);
  // Counter and backboard stay in the same local coordinate system as the cell.
  art+=wall('stall-back',-w/2+5,w/2-5,-d/2,-d/2,5,h-5);
  for(const x of [-w/2+5,w/2-5])art+=line('frame-'+(color==='coral'?'coral':'green'),[at(x,-d/2,0),at(x,-d/2,h+18)],4);
  art+=wall('paint-'+color+'-side face-light',-w/2,w/2,-d/2,d/2,4,25);
  art+=panel('stall-counter',[[-w/2-3,d/2-12,25],[w/2+3,d/2-12,25],[w/2+3,d/2+4,25],[-w/2-3,d/2+4,25]]);
  if(variant==='awning'){
    const count=8;for(let i=0;i<count;i++){
      const a=-w/2+i*w/count,b=a+w/count;
      art+=panel(i%2?'stall-cream':'paint-'+color+'-top',[[a,-d/2-4,h+16],[b,-d/2-4,h+16],[b,d/2+7,h],[a,d/2+7,h]]);
      art+=wall(i%2?'stall-cream':'paint-'+color+'-side face-light',a,b,0,d/2+7,h-8,h);
    }
    art+=panel('stall-heart',[[-10,d/2+.2,9],[0,d/2+.2,6],[10,d/2+.2,17],[5,d/2+.2,21],[0,d/2+.2,18],[-5,d/2+.2,21],[-10,d/2+.2,17]]);
  }else if(variant==='merch'){
    art+=panel('paint-'+color+'-top',[[-w/2-5,-d/2-5,h+15],[w/2+5,-d/2-5,h+15],[w/2+5,d/2+6,h],[-w/2-5,d/2+6,h]]);
    for(const x of [-35,0,35]){
      art+=wall('stall-cream',x-9,x+9,0,d/2+1,29,44);
      art+=line('stall-handle',[at(x-4,d/2+1,44),at(x-4,d/2+1,49),at(x+4,d/2+1,49),at(x+4,d/2+1,44)],1.6);
    }
  }else{
    art+=panel('paint-'+color+'-top',[[-w/2-5,-d/2-5,h+8],[0,-d/2-5,h+25],[w/2+5,-d/2-5,h+8],[w/2+5,d/2+6,h],[-w/2-5,d/2+6,h]]);
    art+=wall('stall-cream',-25,25,0,d/2+.4,8,20);
  }
  // Readable signage follows the projected facade; never mirror lettering.
  let a=P(...at(-w/2+6,d/2+8,h-12)),b=P(...at(w/2-6,d/2+8,h-12));if(a[0]>b[0])[a,b]=[b,a];
  const aw=w-12;
  art+=`<g transform="matrix(${n((b[0]-a[0])/aw)} ${n((b[1]-a[1])/aw)} 0 1 ${n(a[0])} ${n(a[1])})"><rect class="stall-sign" x="-2" y="-12" width="${aw+4}" height="19" rx="2"/><text class="stall-label" x="${aw/2}" y="1" text-anchor="middle">${label}</text></g>`;
  item('building stall',name,u,v,`<title>${label}</title><g class="booth-layout" data-front-normal="0 1">${art}</g>`,'stall-'+variant);
}
function serviceStall(name,u,v,edge,label,variant){
  const w=GRID.cell*1.72,d=GRID.cell*.63,merch=variant==='merch';
  // Local +y points inward: +v at the rear/top edge, -u right, -v bottom.
  // These bounds are the assigned two-by-one cells, including every overhang.
  const at=(x,y,z)=>{
    if(Math.abs(x)>GRID.cell||Math.abs(y)>GRID.cell/2)throw new Error(name+' exceeds its two-cell footprint');
    return edge==='right'?[u-y,v-x,z]:[u+x,v-y,z];
  };
  const panel=(cls,pts)=>poly(cls,pts.map(p=>at(...p)));
  const rail=(cls,pts,width=2)=>line(cls,pts.map(p=>at(...p)),width);
  // Only the reflected right/bottom frames need reversed face winding.
  const block=(cls,a,b,c,e,z,Z)=>{
    const footprint=rect(a,b,c,e).map(p=>at(...p).slice(0,2));
    return prism(cls,edge==='top'?footprint:footprint.reverse(),Z,Z-z);
  };
  const face=(cls,a,b,y,z,Z)=>panel(cls,[[a,y,z],[b,y,z],[b,y,Z],[a,y,Z]]);
  const curve=(cls,commands)=>`<path class="${cls}" d="${commands.map(([op,...pts])=>op+pts.map(p=>P(...at(...p)).map(n).join(' ')).join(' ')).join(' ')}"/>`;
  const flower=(x,y,z)=>{
    let art='';for(let i=0;i<5;i++){const angle=i/5*Math.PI*2,px=x+Math.cos(angle)*4.2,pz=z+Math.sin(angle)*4.2;art+=panel('booth-flower-petal',Array.from({length:10},(_,j)=>[px+Math.cos(j/10*Math.PI*2)*3,y,pz+Math.sin(j/10*Math.PI*2)*3]));}
    return art+panel('booth-flower-center',Array.from({length:12},(_,i)=>[x+Math.cos(i/12*Math.PI*2)*2.7,y,z+Math.sin(i/12*Math.PI*2)*2.7]));
  };
  const parts=[],part=(x,y,art)=>{const[p,q]=at(x,y,0);parts.push({depth:p+q,art});};
  let art=contact(u,v,GRID.cell*.62)+block('booth-plinth',-w/2,w/2,-d/2,d/2,1,5);
  // Four slender supports actually meet the canopy at their local roof heights.
  const roofBack=-d/2-4,roofFront=d/2+4;
  const roofHeight=y=>merch?72+(y-roofBack)/(roofFront-roofBack)*20:94-Math.abs(y)/roofFront*16;
  for(const x of [-w/2+6,w/2-6])for(const y of [-d/2+4,d/2-4])part(x,y,block('booth-post',x-1.7,x+1.7,y-1.7,y+1.7,5,roofHeight(y)));
  // The service counter is on the INNER edge. The back stays open to the camera,
  // so visitors can approach the playground-facing counter and products stay visible.
  const front=d/2-2,back=front-14;
  let counter=(!merch?flower(0,front+.3,18):'')+block('booth-counter',-w/2+11,w/2-11,back,front,5,30)+block('booth-worktop',-w/2+8,w/2-8,back-2,front+2,30,33);
  counter+=rail('booth-trim',[[-w/2+11,front+.2,8],[w/2-11,front+.2,8]],2);
  if(!merch)counter+=flower(0,back-.3,18);
  const counterCenter=at(0,(front+back)/2,0);
  part(0,(front+back)/2,`<g class="booth-service-counter" data-counter-center="${counterCenter.slice(0,2).map(n).join(' ')}">${counter}</g>`);
  if(merch){
    // Representative, unbranded displays: a shirt and tote on a real hanging rail.
    const y=-d/2+8;
    let display=rail('booth-hanging-rail',[[-w/2+7,y,62],[w/2-7,y,62]],1.8);
    for(const x of [-w/2+7,w/2-7])display+=rail('booth-hanging-rail',[[x,-d/2+4,62],[x,y,62]],1.8);
    display+=curve('booth-hanger',[['M',[-33,y,60]],['Q',[-30,y,67],[-27,y,62]],['L',[-28,y,56]],['L',[-43,y,50]],['L',[-17,y,50]],['L',[-28,y,56]]]);
    display+=panel('booth-shirt',[[-38,y-.1,53],[-22,y-.1,53],[-7,y-.1,45],[-14,y-.1,36],[-20,y-.1,40],[-20,y-.1,22],[-40,y-.1,22],[-40,y-.1,40],[-46,y-.1,36],[-53,y-.1,45]]);
    display+=curve('booth-shirt-collar',[['M',[-37,y-.3,53]],['Q',[-30,y-.3,45],[-23,y-.3,53]]]);
    display+=face('booth-tote',14,41,y-.2,26,48)+panel('booth-tote-side',[[41,y-.2,26],[45,y+3,28],[45,y+3,46],[41,y-.2,48]]);
    display+=curve('booth-tote-handle',[['M',[20,y-.3,48]],['Q',[19,y-.3,63],[27,y-.3,63]],['Q',[35,y-.3,63],[35,y-.3,48]]]);
    part(0,y,`<g class="booth-product-display"><title>Trưng bày minh họa: áo thun và túi tote</title>${display}</g>`);
    part(-21,front-7,`<g class="booth-folded-shirts">${block('booth-fold-blue',-39,-11,front-13,front-2,33,36)}${block('booth-fold-cream',-36,-12,front-12,front-3,36,39)}</g>`);
  }else{
    // Two large, readable interior objects: a notice display and postcard holder.
    const y=-d/2+7;
    let notice=block('booth-notice-support',-39,-36,y-1,y+1,5,29)+block('booth-notice-frame',-58,-17,y-1,y+1,29,59)+face('booth-notice-paper',-55,-20,y-1.2,32,56);
    notice+=face('booth-notice-blue',-50,-25,y-1.4,47,51)+face('booth-notice-yellow',-50,-30,y-1.4,38,42);
    part(-37,y,`<g class="booth-notice">${notice}</g>`);
    const brochures=block('booth-card-holder',24,45,front-12,front-3,33,38)+face('booth-card',27,42,front-10,36,48)+face('booth-card-mark',30,39,front-10.2,40,43);
    part(35,front-7,`<g class="booth-brochures">${brochures}</g>`);
  }
  art+=parts.sort((a,b)=>a.depth-b.depth).map(p=>p.art).join('');
  if(merch){
    // Sloping striped fabric, with a scalloped vertical valance at the inner edge.
    for(let i=0;i<6;i++){
      const a=-w/2-4+i*(w+8)/6,b=a+(w+8)/6,cls=i%2?'booth-awning-cream':'booth-awning-coral';
      art+=panel(cls,[[a,roofBack,72],[b,roofBack,72],[b,roofFront,92],[a,roofFront,92]]);
      art+=curve(cls,[['M',[a,roofFront,92]],['L',[b,roofFront,92]],['L',[b,roofFront,86]],['Q',[(a+b)/2,roofFront,76],[a,roofFront,86]],['Z']]);
    }
    art+=rail('booth-roof-trim',[[-w/2-4,roofBack,72],[w/2+4,roofBack,72]],1.6);
  }else{
    art+=panel('booth-canopy-back',[[-w/2-4,roofBack,78],[w/2+4,roofBack,78],[w/2+4,0,94],[-w/2-4,0,94]])+panel('booth-canopy-front',[[-w/2-4,0,94],[w/2+4,0,94],[w/2+4,roofFront,78],[-w/2-4,roofFront,78]]);
    art+=face('booth-canopy-edge',-w/2-4,w/2+4,roofFront,75,78);
    for(const x of [-w/2+6,w/2-6])art+=rail('booth-roof-frame',[[x,-d/2+4,roofHeight(-d/2+4)],[x,0,94],[x,d/2-4,roofHeight(d/2-4)]],1.7);
  }
  // Both local frames point inward along +y; mount the complete sign on -y,
  // the outer eave, with short supports anchored to that same roof edge.
  const signY=roofBack-.4,mountZ=roofHeight(roofBack),aw=w+8;
  for(const x of [-w*.35,w*.35])art+=rail('booth-roof-frame',[[x,roofBack,mountZ],[x,signY,mountZ+7]],2);
  let a=P(...at(-aw/2,signY,mountZ+19)),b=P(...at(aw/2,signY,mountZ+19));if(a[0]>b[0])[a,b]=[b,a];
  art+=`<g class="booth-fascia" transform="matrix(${n((b[0]-a[0])/aw)} ${n((b[1]-a[1])/aw)} 0 1 ${n(a[0])} ${n(a[1])})"><rect class="booth-sign" x="0" y="-14" width="${aw}" height="28" rx="1.5"/><text class="booth-label" x="${aw/2}" y="5" text-anchor="middle">${label.replace(' · ',' ')}</text></g>`;
  const frontNormal=edge==='right'?'-1 0':edge==='top'?'0 1':'0 -1';
  item('building stall',name,u,v,`<title>${label}</title><g class="booth-layout" data-front-normal="${frontNormal}" data-two-cell-bounds="${GRID.cell} ${GRID.cell/2}">${art}</g>`,'stall-'+variant);
}
stall('poet-community',lo+GRID.cell*3,near,'top','yellow','POET · Community','info');
stall('big-joy-little-joy',lo+GRID.cell*5.3,near,'top','green','Big Joy Little Joy','awning');
stall('young-joy-collection',lo+GRID.cell*7.6,near,'top','coral','Young Joy Collection','merch');

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
function haveFunSign(u,v){
  // Large park billboard on two posts (after the former parkSign), standing on the left tile strip.
  // Its face lies in the constant-u plane so the lettering reads along the board edge.
  const point=(offset,z,back=0)=>[u+back,v-offset,z];
  const W=64,TOP=118,BOTTOM=62,POST=46,BASE=9;
  const board=(cls,back=0,pad=0)=>{
    const[x,y]=P(...point(-W-pad,TOP+pad,back));
    return `<rect class="${cls}" x="0" y="0" width="${2*(W+pad)}" height="${TOP-BOTTOM+2*pad}" rx="${10+pad}" ry="${10+pad}" transform="matrix(${n(C)} -.44 0 1 ${n(x)} ${n(y)})"/>`;
  };
  let s='';
  for(const o of [-POST,POST])s+=post('paint-green',u+4,v-o,BASE,TOP-BASE-6,3.2)+box('paint-yellow',u-.5,u+8.5,v-o-4.5,v-o+4.5,BASE+5,BASE+14);
  s+=`<g class="join-joy-aura" aria-hidden="true" pointer-events="none">${board('join-joy-halo')}${board('join-joy-rim')}</g>`+board('join-joy-edge',3)+board('join-joy-face');
  const[x,y]=P(...point(0,(TOP+BOTTOM)/2-10));
  s+=`<g transform="matrix(${n(C)} -.44 0 1 ${n(x)} ${n(y)})"><text class="join-joy-lettering" x="9" y="0" text-anchor="middle"><tspan>Have</tspan> <tspan dx="1">fun</tspan></text><path class="join-joy-arrow" d="M-45-10h-9m4-4-4 4 4 4"/></g>`;
  s+=`<title>Have fun — khám phá hoạt động POET</title>`;
  const[ox,oy]=P(u,v,0).map(n);
  const attachment=P(u,v,BASE).map(n).join(' ');
  // Input follows the painted face and posts only; no bounding rectangle over the tiles behind.
  const outline=pts=>'M'+pts.map(p=>P(...p).map(n).join(' ')).join('L')+'Z';
  const hit=`<path class="join-joy-hit" d="${outline([point(-W-6,TOP+6),point(W+6,TOP+6),point(W+6,BOTTOM-6),point(-W-6,BOTTOM-6)])}${[-POST,POST].map(o=>outline([point(o-6,BOTTOM,4),point(o+6,BOTTOM,4),point(o+6,BASE,4),point(o-6,BASE,4)])).join('')}" fill="transparent"/>`;
  item('prop','have-fun-sign',u,v,`<g class="join-joy-size" transform="translate(${ox} ${oy}) scale(1.35) translate(${-ox} ${-oy})"><a class="join-joy-link" href="#hoat-dong" aria-label="Have fun — khám phá hoạt động POET" tabindex="0">${hit}<g class="join-joy-invite"><g class="join-joy-hover" data-origin="${attachment}">${s}</g></g></a></g>`);
  // Aim at the actual middle of the upper face edge, including the sign's 1.35 scale.
  // The former freehand endpoint stopped above its far corner and looked detached.
  const a=P(...point(-W,TOP)).map(n),b=P(...point(W,TOP)).map(n);
  const tx=n(ox+((a[0]+b[0])/2-ox)*1.35),ty=n(oy+((a[1]+b[1])/2-oy)*1.35);
  const xTip=tx,yTip=n(ty-8),pt=(dx,dy)=>`${n(xTip+dx)} ${n(yTip+dy)}`;
  // Exterior root-SVG coordinates; share the sign's float/drift parents.
  return `<g class="join-joy-cue" aria-hidden="true" data-target="have-fun-sign"><path class="cue-line" d="M${pt(-160,28)}C${pt(-194,-52)} ${pt(-157,-103)} ${pt(-88,-97)}C${pt(-44,-92)} ${pt(-14,-42)} ${pt(0,0)}"/><path class="cue-head" d="M${pt(-11,-10)}Q${pt(-5,-8)} ${pt(0,0)}L${pt(2,-14)}"/></g>`;
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
  Z*=1.3*1.15;const[x,y]=P(u,v,10),w=Z*iw/ih,ground=P(u,v,10).map(n).join(' ');
  item('character',name,u,v,contact(u,v,17,9)+`<g class="flower-hover" data-origin="${ground}" style="transform-origin:${origin([u,v,10])}"><g class="character-body" data-origin="${ground}" style="transform-origin:${origin([u,v,10])}"><image id="flower-image-${name}" href="../assets/mascot/be-cuc/${file}.webp" x="${n(x-w/2)}" y="${n(y-Z)}" width="${n(w)}" height="${n(Z)}"/></g></g>`,extra+' flower-character');
}
tree('school-tree',near,near,.8);

// One flowering shrub sits on the front-left tile strip itself.

const cue=haveFunSign(48,620);
// Keep the walking lane clear; these two figures stand just inside the route.
figure('daisy-explorer','du-lich',239,200,450,645,72,'npc');
figure('daisy-juice','enjoy',183,200,625,395,74);
figure('daisy-welcome','vui-tuoi',180,200,190,600,75);
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
const mark='';
const walkRoute=[...route.slice(ROUTE_START),...route.slice(0,ROUTE_START)],walkStops=walkRoute.map(p=>P(p.u,p.v,10).map(n));
const walkPath=`<path id="poet-mascot-route" d="${[...walkStops,walkStops[0]].map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}" fill="none" stroke="none" pointer-events="none" data-start-x="${walkStops[0][0]}" data-start-y="${walkStops[0][1]}" data-tile-orders="${walkRoute.map(p=>p.order).join(',')}"/>`;
// Preserve the official standing artwork; enlarge 15%, anchored at its feet.
const[mx,my]=P(652,652,10),anchor={x:n(mx/W*100),y:n(my/H*100)};
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
  console.log(JSON.stringify({written:'v2/index.html',board:1,grid:GRID,thickness:14,tiles:route.length,closedRoute:true,schools:1,schoolCells:3,houses:0,stalls:3,equipment:4,mascot:anchor}));
}else console.log(svg);

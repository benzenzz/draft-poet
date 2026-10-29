// POET floating playground: a continuous physical route across four floating elevations.
// `node v2/tools/floating-playground.mjs --write` regenerates only the hero SVG and mascot anchor.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const C=Math.cos(Math.PI/6), P=(u,v,h=0)=>[720+(u-v)*C,160+(u+v)/2-h];
const n=x=>Number(x.toFixed(2)), xy=p=>P(...p).map(n).join(',');
const poly=(cls,ps)=>`<polygon class="${cls}" points="${ps.map(xy).join(' ')}"/>`;
const line=(cls,ps,w=4)=>`<polyline class="${cls}" points="${ps.map(xy).join(' ')}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
const origin=p=>P(...p).map(n).join('px ')+'px';
const group=(cls,name,p,s,attrs='')=>`<g class="${cls}" data-obj="${name}" style="transform-origin:${origin(p)}" ${attrs}>${s}</g>`;
const circle=(u,v,r,h,k=32)=>Array.from({length:k},(_,i)=>[u+Math.cos(i/k*Math.PI*2)*r,v+Math.sin(i/k*Math.PI*2)*r,h]);
const contact=(u,v,r,h)=>poly('contact',circle(u+8,v+8,r,h));
function prism(cls,fp,h,depth){
  let s='';const faces=[];let previous=null;
  fp.forEach((a,i)=>{
    const b=fp[(i+1)%fp.length],pa=P(...a,h),pb=P(...b,h);
    if(pb[0]>=pa[0]-.01){previous=null;return;}
    const face=pb[1]>pa[1]?'face-dark':'face-light';
    if(previous&&previous.face===face)previous.points.push(b);
    else{previous={face,points:[a,b]};faces.push(previous);}
  });
  // Merge each continuous side into one filled face, avoiding antialias seams on curved tiles.
  for(const {face,points} of faces)s+=poly(`${cls}-side ${face}`,[...points.map(p=>[...p,h]),...points.map(p=>[...p,h-depth]).reverse()]);
  return s+poly(cls+'-top',fp.map(p=>[...p,h]));
}
const box=(cls,a,b,c,d,h0,h1)=>prism(cls,[[a,c],[b,c],[b,d],[a,d]],h1,h1-h0);
const post=(cls,u,v,h,H,r=3)=>box(cls,u-r,u+r,v-r,v+r,h,h+H);
const terrainData=[
  {name:'arrival',a:0,b:340,c:330,d:650,h:20,depth:100,color:'coral',start:0,end:5},
  {name:'swing',a:0,b:340,c:0,d:290,h:110,depth:130,color:'green',start:5,end:11},
  {name:'discovery',a:390,b:740,c:0,d:310,h:165,depth:150,color:'yellow',start:11,end:17},
  {name:'together',a:390,b:740,c:355,d:680,h:45,depth:110,color:'blue',start:17,end:22},
];
function terrain(t){
  const {a,b,c,d,h,depth}=t,r=13,fp=[[a+r,c],[b-r,c],[b,c+r],[b,d-r],[b-r,d],[a+r,d],[a,d-r],[a,c+r]];
  let s=prism('terrain',fp,h,depth)+poly('terrain-cap',fp.map(p=>[...p,h+4]));
  for(let u=a+28;u<b-20;u+=54)s+=poly('terrain-stratum',[[u,d,h-15],[u+15,d,h-15],[u+15,d,h-depth+8],[u,d,h-depth+8]]);
  for(let v=c+28;v<d-20;v+=54)s+=poly('terrain-stratum dark-stratum',[[b,v,h-15],[b,v+15,h-15],[b,v+15,h-depth+8],[b,v,h-depth+8]]);
  s+=line('terrain-lip',[[a,d-r,h],[a+r,d,h],[b-r,d,h],[b,d-r,h],[b,c+r,h]],3);
  return group('build-item terrain t-'+t.color,t.name,[(a+b)/2,(c+d)/2,h-depth],s,'data-build="terrain"');
}
function curve(nodes,r=40){
  const ps=[nodes[0]];
  for(let i=1;i<nodes.length-1;i++){
    const p=nodes[i-1],q=nodes[i],s=nodes[i+1];
    const a=mix(q,p,Math.min(r/Math.hypot(p[0]-q[0],p[1]-q[1]),.4)),b=mix(q,s,Math.min(r/Math.hypot(s[0]-q[0],s[1]-q[1]),.4));
    ps.push(a);for(let j=1;j<=14;j++){const t=j/14;ps.push(a.map((x,k)=>(1-t)**2*x+2*(1-t)*t*q[k]+t*t*b[k]));}
  }
  ps.push(nodes.at(-1));const ds=[0];ps.slice(1).forEach((p,i)=>ds.push(ds.at(-1)+Math.hypot(p[0]-ps[i][0],p[1]-ps[i][1])));
  return {length:ds.at(-1),at(d){let i=1;while(i<ds.length-1&&ds[i]<d)i++;const a=ps[i-1],b=ps[i],l=ds[i]-ds[i-1];return {p:mix(a,b,(d-ds[i-1])/l),t:[(b[0]-a[0])/l,(b[1]-a[1])/l]};}};
}
const route=[],pieces=[],colors=['green','blue','yellow','coral'];let order=0,tileCount=0;
function clockwise(ps){const area=ps.reduce((s,p,i)=>{const a=P(...p,0),b=P(...ps[(i+1)%ps.length],0);return s+a[0]*b[1]-b[0]*a[1];},0);return area<0?ps.reverse():ps;}
function tiles(nodes,weights){
  const c=curve(nodes),sum=weights.reduce((a,b)=>a+b,0);let distance=0;
  for(const weight of weights){
    const length=weight/sum*c.length,a=[],b=[],ai=[],bi=[];
    for(let j=0;j<=24;j++){
      const {p:[u,v,h],t:[tu,tv]}=c.at(distance+.9+(length-1.8)*j/24);
      a.push([u-tv*31,v+tu*31]);b.push([u+tv*31,v-tu*31]);
      ai.push([u-tv*27,v+tu*27,h+.6]);bi.push([u+tv*27,v-tu*27,h+.6]);
    }
    const fp=clockwise([...a,...b.reverse()]),h=nodes[0][2],color=colors[tileCount%4],middle=c.at(distance+length/2).p;
    let s=prism('path-tile',fp,h,15)+poly('tile-inset',[...ai,...bi.reverse()]);
    if(tileCount%3===1)s+=poly('tile-peg',circle(middle[0],middle[1],3.5,h+1,12));
    const from=c.at(distance).p,to=c.at(distance+length).p;
    route.push({kind:'tile',order,from,to});
    pieces.push({order,s:group(`build-item tile t-${color}`,'tile-'+(++tileCount),middle,s,`data-build="tile" data-order="${order++}"`)});
    distance+=length;
  }
}
function stairs(name,a,b,count){
  const du=b[0]-a[0],dv=b[1]-a[1],l=Math.hypot(du,dv),nu=-dv/l,nv=du/l;let s='';
  const steps=Array.from({length:count},(_,i)=>({i,p:mix(a,b,(i+.5)/count)})).sort((a,b)=>(a.p[0]+a.p[1])-(b.p[0]+b.p[1]));
  for(const {i} of steps){
    const p=mix(a,b,i/count),q=mix(a,b,(i+1)/count),h=a[2]+(b[2]-a[2])*(i+.5)/count;
    const fp=clockwise([[p[0]+nu*31,p[1]+nv*31],[q[0]+nu*31,q[1]+nv*31],[q[0]-nu*31,q[1]-nv*31],[p[0]-nu*31,p[1]-nv*31]]);
    s+=prism('stair',fp,h,Math.abs(b[2]-a[2])/count+12)+line('stair-nosing',[[q[0]+nu*29,q[1]+nv*29,h+.3],[q[0]-nu*29,q[1]-nv*29,h+.3]],2);
  }
  route.push({kind:'connector',order,from:a,to:b});pieces.push({order,s:group('build-item connector',name,mix(a,b,.5),s,`data-build="connector" data-order="${order++}"`)});
}
tiles([[95,600,36],[95,362,36]],[1,.85,1.1,1]);
stairs('first-ascent',[95,362,36],[95,248,126],7);
tiles([[95,248,126],[95,100,126],[300,100,126]],[1,.8,1.1,.85,1.05]);
stairs('sky-bridge',[300,100,126],[440,100,181],6);
tiles([[440,100,181],[650,100,181],[650,270,181]],[1.1,.85,1.15,.9,1.1]);
stairs('discovery-descent',[650,270,181],[650,420,61],8);
tiles([[650,420,61],[650,500,61],[480,500,61],[480,610,61]],[.85,1.1,.95,1.15,.9]);
const equipment=(name,p,s)=>group('build-item equipment',name,p,`<g class="object-hover">${s}</g>`,'data-build="equipment"');
function slide(){
  const u=225,v=440,h=20,z=120;let s=contact(u+25,v+65,55,h+5);
  for(const x of [u,u+64])for(const y of [v,v+55])s+=post('paint-yellow',x,y,h,150,4);
  s+=box('paint-green',u-6,u+70,v-6,v+61,z-9,z);
  for(let i=0;i<5;i++)s+=box('paint-yellow',u+4,u+58,v-65+i*13,v-59+i*13,h+i*20,h+i*20+5);
  const run=Array.from({length:25},(_,i)=>{const t=i/24;return [u+32,v+55+t*140,z-94*(.5-.5*Math.cos(t*Math.PI))];});
  s+=poly('paint-blue-top',[...run.map(([u,v,h])=>[u-22,v,h]),...run.map(([u,v,h])=>[u+22,v,h]).reverse()]);
  s+=poly('paint-blue-side face-dark',[...run.map(([u,v,h])=>[u+22,v,h]),...run.map(([u,v,h])=>[u+22,v,h+9]).reverse()])+line('slide-rail',run.map(([u,v,h])=>[u-22,v,h+4]),3);
  const cs=[[u-12,v-12,h+155],[u+76,v-12,h+155],[u+76,v+67,h+155],[u-12,v+67,h+155]],peak=[u+32,v+27,h+190];
  s+=poly('paint-coral-side face-light',[cs[3],cs[2],peak])+poly('paint-coral-top',[cs[1],cs[2],peak]);return equipment('slide',[u+32,v+90,h],s);
}
function swing(){
  const a=170,b=290,v=215,h=110,H=130;let s=contact(230,v,64,h+5);
  for(const u of [a,b])s+=line('frame-green',[[u,v-31,h],[u,v,h+H],[u,v+31,h]],7);
  s+=box('paint-coral',a-10,b+10,v-5,v+5,h+H-6,h+H+3);
  const seat=line('rope',[[216,v,h+H-5],[216,v,h+29]],2)+line('rope',[[245,v,h+H-5],[245,v,h+29]],2)+box('paint-yellow',209,252,v-13,v+13,h+21,h+29);
  return equipment('swing',[230,v,h],s+group('swing-seat ambient','swing-seat',[230,v,h+H-4],seat));
}
function seesaw(){
  const u=500,v=220,h=165,H=30;let s=contact(u,v,65,h+5)+poly('paint-yellow-side face-dark',[[u-17,v+13,h],[u+17,v+13,h],[u,v+13,h+H]])+poly('paint-yellow-top',[[u,v-15,h+H],[u,v+13,h+H],[u+17,v+13,h],[u+17,v-15,h]]);
  let plank=poly('paint-blue-top',[[u-75,v-15,h+H-13],[u+75,v-15,h+H+13],[u+75,v+15,h+H+13],[u-75,v+15,h+H-13]])+poly('paint-blue-side face-dark',[[u-75,v+15,h+H-13],[u+75,v+15,h+H+13],[u+75,v+15,h+H+6],[u-75,v+15,h+H-20]]);
  for(const [x,z]of[[u-52,h+H-9],[u+52,h+H+9]])plank+=post('paint-coral',x,v,z,23,2)+line('frame-coral',[[x,v-12,z+23],[x,v+12,z+23]],5);
  return equipment('seesaw',[u,v,h],s+group('seesaw-plank','seesaw-plank',[u,v,h+H],plank));
}
function carousel(){
  const u=620,v=595,h=45;let s=contact(u,v,65,h+5)+prism('paint-green',circle(u,v,56,0).map(p=>p.slice(0,2)),h+18,12)+poly('paint-yellow-top',circle(u,v,38,h+19));
  for(const a of [.3,1.9,3.45,5]){const x=u+Math.cos(a)*40,y=v+Math.sin(a)*40;s+=post('paint-coral',x,y,h+19,37,2.5)+line('frame-coral',[[x,y,h+56],[u,v,h+56]],4);}
  return equipment('roundabout',[u,v,h],s+post('paint-blue',u,v,h+18,44,4));
}
function tree(name,u,v,h,size=1){
  const[x,y]=P(u,v,h+48*size),r=23*size;
  const s=contact(u,v,20*size,h+5)+post('paint-green',u,v,h,45*size,3*size)+`<path class="tree-crown" d="M${n(x-r)} ${n(y)}a${r} ${r} 0 0 1 ${r*2} 0v${n(r*.35)}a${r} ${r} 0 0 1 ${-r*2} 0Z"/><ellipse class="tree-shade" cx="${n(x)}" cy="${n(y+r*.65)}" rx="${r}" ry="${n(r*.45)}"/>`;
  return group('build-item vegetation',name,[u,v,h],s,'data-build="vegetation"');
}
function flowers(u,v,h){let s='';for(let i=0;i<3;i++){const[x,y]=P(u+i*12,v-i*6,h+8+i%2*7);s+=`<path class="flower-stem" d="M${n(x)} ${n(y+12)}v-12"/>`;for(let k=0;k<5;k++){const a=k/5*Math.PI*2;s+=`<ellipse class="flower-petal" cx="${n(x+Math.cos(a)*4)}" cy="${n(y+Math.sin(a)*4)}" rx="3.5" ry="3"/>`;}s+=`<circle class="flower-heart" cx="${n(x)}" cy="${n(y)}" r="2.8"/>`;}return group('build-item vegetation','flowers-'+u,[u,v,h],s,'data-build="vegetation"');}
function figure(name,file,iw,ih,u,v,h,H,cls=''){
  const[x,y]=P(u,v,h),w=H*iw/ih;
  return group('build-item character '+cls,name,[u,v,h],contact(u,v,17,h-2)+`<g class="character-body"><image href="assets/mascot/be-cuc/${file}.webp" x="${n(x-w/2)}" y="${n(y-H)}" width="${n(w)}" height="${H}"/></g>`,'data-build="character"');
}
function ball(u,v,h){const[x,y]=P(u,v,h+14);return group('build-item prop','ball',[u,v,h],contact(u,v,13,h+3)+`<circle class="paint-coral-top" cx="${n(x)}" cy="${n(y)}" r="13"/><path class="ball-stripe" d="M${n(x-8)} ${n(y-10)}q-5 14 12 21"/>`,'data-build="prop"');}
const contents={
  arrival:slide()+tree('arrival-tree',32,390,20,.85)+flowers(250,615,24)+figure('daisy-arrival','enjoy',183,200,188,590,24,65)+ball(48,550,24),
  swing:swing()+tree('swing-tree',40,55,110,1.1)+flowers(285,40,114)+figure('daisy-swing','vui-tuoi',180,200,180,80,114,66),
  discovery:seesaw()+tree('discovery-tree',720,65,165,.85)+flowers(450,250,169)+figure('daisy-explorer','du-lich',239,200,555,100,181,62,'npc'),
  together:carousel()+tree('together-tree',705,410,45,.8)+flowers(420,640,49)+figure('daisy-together','song-gio',147,200,710,565,49,68),
};
const scene=[];
for(const t of [...terrainData].sort((a,b)=>(a.a+a.c)-(b.a+b.c)))scene.push(terrain(t),...pieces.filter(p=>p.order>=t.start&&p.order<t.end).map(p=>p.s),contents[t.name]);
const clouds=[[205,245,1.05],[1190,745,.9],[505,85,.7]].map(([x,y,s],i)=>`<g class="build-item cloud" data-build="cloud" data-obj="cloud-${i}"><g transform="translate(${x} ${y}) scale(${s})"><path class="cloud-shape" d="M-54 14c-23 0-27-30-6-37 0-23 29-33 43-16 18-23 52-10 52 12 32-7 48 38 15 42Z"/></g></g>`).join('');
const shadows=terrainData.map(t=>{const[x,y]=P((t.a+t.b)/2,(t.c+t.d)/2,t.h-t.depth-38);return `<ellipse class="island-shadow" cx="${n(x)}" cy="${n(y)}" rx="150" ry="37"/>`;}).join('');
const mark='<g class="intro-mark"><g transform="translate(720 430)"><path fill="var(--green)" d="M0-45 39-22 0 0-39-22Z"/><path fill="var(--blue)" d="M-39-15 0 8-39 31-78 8Z"/><path fill="var(--yellow)" d="M39-15 78 8 39 31 0 8Z"/><path fill="var(--coral)" d="M0 16 39 39 0 62-39 39Z"/></g></g>';
const svg=`<svg class="playground" viewBox="0 0 1440 1000" aria-hidden="true" focusable="false">\n${shadows}\n${scene.join('\n')}\n${clouds}\n${mark}\n</svg>`;
const[mx,my]=P(480,610,61),anchor={x:n(mx/14.4),y:n(my/10)};
for(let i=1;i<route.length;i++)if(Math.hypot(...route[i].from.map((x,k)=>x-route[i-1].to[k]))>.01)throw new Error('Disconnected route at '+i);
if(tileCount!==19||route.length!==22)throw new Error('Unexpected path topology');
if(process.argv.includes('--write')){
  const file=fileURLToPath(new URL('../index.html',import.meta.url));let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<svg class="playground"[\s\S]*?<\/svg>/,svg).replace(/(<div class="mascot" style=")[^"]*(")/,`$1--x: ${anchor.x}%; --y: ${anchor.y}%$2`);
  fs.writeFileSync(file,html);console.log(JSON.stringify({written:'v2/index.html',tiles:tileCount,connectors:3,terraces:4,mascot:anchor,routeContinuous:true}));
}else console.log(svg);

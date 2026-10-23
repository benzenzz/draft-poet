// Word wrapping for masked line reveals. Custom tags (m-w, m-wi) so page rules for
// spans (e.g. the yellow block line in story titles) never restyle the wrappers. Only regular whitespace splits, so the
// build's no-orphan &nbsp; glue keeps its last two words together.
export function splitWords(el){
  if(el.hasAttribute('data-m-split'))return;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    if(!node.data.trim())continue;
    const frag=document.createDocumentFragment();
    for(const part of node.data.split(/([ \t\n\r]+)/)){
      if(!part)continue;
      if(/^[ \t\n\r]+$/.test(part)){frag.append(part);continue;}
      const outer=document.createElement('m-w'),inner=document.createElement('m-wi');inner.textContent=part;outer.append(inner);frag.append(outer);
    }
    node.replaceWith(frag);
  }
  el.setAttribute('data-m-split','');
}

// Delays each word by the visual line it sits on; returns the line count.
// Measured at reveal time, so fonts and the current width are final.
export function staggerLines(el,{base=0,step=90}={}){
  let line=-1,top=null;
  for(const w of el.querySelectorAll('m-w')){
    const t=w.offsetTop;
    if(top===null||Math.abs(t-top)>4){line++;top=t;}
    w.firstChild.style.transitionDelay=`${base+line*step}ms`;
  }
  return line+1;
}

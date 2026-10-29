// Demi's call (2026-10-24): the site plays its full motion on every device, including
// ones whose OS asks for reduced motion. Loaded first in <head>, as a classic script, so
// every later script sees prefers-reduced-motion as off. ?heroMotion=respect restores the
// OS setting for testing the reduced versions.
(function(){
  if(/[?&]heroMotion=respect\b/.test(location.search))return;
  var RM=/prefers-reduced-motion\s*:\s*reduce/,NP=/prefers-reduced-motion\s*:\s*no-preference/,mm=window.matchMedia;
  if(!mm)return;
  window.matchMedia=function(q){
    if(!RM.test(q))return mm.call(window,q);
    var noop=function(){};
    return {matches:false,media:q,onchange:null,addEventListener:noop,removeEventListener:noop,addListener:noop,removeListener:noop,dispatchEvent:function(){return false;}};
  };
  // CSS: drop reduce-only blocks and unwrap no-preference blocks, so stylesheets behave
  // as on a device without the setting. Only needed where the OS actually reports it.
  if(!mm.call(window,'(prefers-reduced-motion: reduce)').matches)return;
  function fix(list,owner){
    for(var i=list.length-1;i>=0;i--){
      var r=list[i],m=r.media&&r.media.mediaText;
      if(m&&RM.test(m)){owner.deleteRule(i);continue;}
      if(m&&NP.test(m)){var inner=[].map.call(r.cssRules,function(x){return x.cssText;});owner.deleteRule(i);for(var k=inner.length-1;k>=0;k--)owner.insertRule(inner[k],i);continue;}
      if(r.cssRules)fix(r.cssRules,r);
    }
  }
  function run(){for(var s=0;s<document.styleSheets.length;s++){var sh=document.styleSheets[s],rules;try{rules=sh.cssRules;}catch(e){continue;}if(sh.ownerNode&&sh.ownerNode.dataset.motionFixed)continue;fix(rules,sh);if(sh.ownerNode)sh.ownerNode.dataset.motionFixed='1';}}
  document.addEventListener('DOMContentLoaded',run);
  addEventListener('load',run);
})();

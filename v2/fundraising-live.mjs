// Worker-grounded campaign totals. Replaces the baked, provisional progress
// number with the live totalAmount once the donations API answers. The baked
// values stay as the no-JS / offline fallback; ?fundraisingPreview overrides
// win locally. On any failure the static numbers remain untouched.
export function initFundraisingLive(scope=document) {
  const cards=scope.querySelectorAll('[data-fundraising]');
  if(!cards.length)return false;
  const base=typeof window.POET_API_BASE==='string'&&/^https:\/\//.test(window.POET_API_BASE)?window.POET_API_BASE:'';
  if(!base||typeof fetch!=='function'||typeof AbortSignal?.timeout!=='function')return false;
  const refresh=async()=>{
    try{
      const response=await fetch(`${base}/api/donations?sort=new`,{signal:AbortSignal.timeout(10000)});
      if(!response.ok)return;
      const data=await response.json().catch(()=>null);
      const total=Number(data?.totalAmount);
      if(!Number.isFinite(total)||total<0)return;
      for(const card of cards){
        if(card.dataset.localPreview==='true')continue;
        card.dataset.raised=String(total);
        if(card.dataset.provisional==='true')delete card.dataset.provisional;
      }
    }catch{/* keep the baked, provisional numbers */}
  };
  refresh();
  return true;
}

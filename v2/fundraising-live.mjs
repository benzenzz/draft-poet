// Worker-grounded campaign totals. Replaces the baked, provisional progress
// number with the live totalAmount once the donations API answers. The baked
// values stay as the no-JS / offline fallback; ?fundraisingPreview overrides
// win locally. On any failure the static numbers remain untouched.
//
// New Worker payloads also carry a `fundraising` object: raised = individual
// success donations + business `received` deals, with the two public counts.
// When that object is absent (Worker not deployed yet) only the amount follows
// totalAmount and the fixture counts 248 / 14 stay, so live money is never
// mixed with fixture partners.

/**
 * Pure mapping for tests. Returns { raised, individual, business } when the
 * payload carries a usable fundraising object, else null. Counts may be null
 * individually when malformed; the writer skips them per kind.
 */
export function parseFundraising(data) {
  const f = data?.fundraising;
  if (!f || typeof f !== 'object') return null;
  const raised = Number(f.raisedAmount);
  if (!Number.isFinite(raised) || raised < 0) return null;
  const count = (v) => {
    const n = Number(v);
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
  };
  return { raised, individual: count(f.individualCount), business: count(f.businessCount) };
}

// sr-only labels under each counter: "248 người" / "14 đối tác".
const KIND_SUFFIX = { individual: 'người', business: 'đối tác' };
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

/** One card: counts by explicit kind (never DOM order), then the amount. */
function applyToCard(card, f) {
  for (const counter of card.querySelectorAll('[data-fund-count]')) {
    const kind = counter.dataset.fundKind;
    const value = kind === 'individual' ? f.individual : kind === 'business' ? f.business : null;
    if (value === null || value === undefined) continue;
    counter.dataset.fundCount = String(value);
    const label = counter.closest('strong')?.querySelector('.sr-only');
    if (label && KIND_SUFFIX[kind]) label.textContent = `${fmt(value)} ${KIND_SUFFIX[kind]}`;
  }
  // Counts must land before data-raised: fundraising-reveal's update() reads
  // dataset.fundCount when the amount attribute changes.
  card.dataset.raised = String(f.raised);
  if (card.dataset.provisional === 'true') delete card.dataset.provisional;
  // "Số liệu minh họa" note and every aria-describedby pointing at it.
  const note = card.querySelector('.fund-preview-note');
  if (note) {
    note.hidden = true;
    if (note.id) {
      for (const el of card.querySelectorAll('[aria-describedby]')) {
        const ids = el.getAttribute('aria-describedby').split(/\s+/);
        if (!ids.includes(note.id)) continue;
        const rest = ids.filter((id) => id !== note.id).join(' ');
        if (rest) el.setAttribute('aria-describedby', rest);
        else el.removeAttribute('aria-describedby');
      }
    }
  }
}

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
      const f=parseFundraising(data);
      if(f){
        for(const card of cards){
          if(card.dataset.localPreview==='true')continue;
          applyToCard(card,f);
        }
      }else{
        // Old Worker without the fundraising object: amount only, counts untouched.
        const total=Number(data?.totalAmount);
        if(!Number.isFinite(total)||total<0)return;
        for(const card of cards){
          if(card.dataset.localPreview==='true')continue;
          card.dataset.raised=String(total);
          if(card.dataset.provisional==='true')delete card.dataset.provisional;
        }
      }
    }catch{/* keep the baked, provisional numbers */}
  };
  refresh();
  return true;
}

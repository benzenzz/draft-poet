// Explicit local visual-QA fixture. Never changes source data or checkout settings.
export function localPreviewAmount(location) {
  if(!['127.0.0.1','localhost','[::1]'].includes(location.hostname))return null;
  const raw=new URLSearchParams(location.search).get('fundraisingPreview');
  if(raw===null||!/^\d{1,12}$/.test(raw))return null;
  const amount=Number(raw);
  return Number.isSafeInteger(amount)?amount:null;
}

export function initLocalFundraisingPreview(scope=document,location=window.location) {
  const amount=localPreviewAmount(location);
  if(amount===null)return false;
  const card=scope.querySelector('[data-fund-animate]');
  if(!card)return false;
  card.dataset.raised=String(amount);
  card.dataset.localPreview='true';
  const note=scope.createElement('p');
  note.className='fund-preview-note';note.id='local-fund-preview-note';
  note.textContent='Dữ liệu xem thử';
  card.querySelector('.fund-heading').after(note);
  card.setAttribute('aria-describedby',note.id);
  return true;
}

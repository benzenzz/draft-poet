// Shared existing Worker/PayOS checkout contract. The provider supplies the QR.
// API base comes from root config.js: v2/site.js imports it first, and ung-ho
// pages load it as a defer script before this one.
(() => {
  const API_BASE = window.POET_API_BASE;
  async function open(details,{resultBase=new URL('.',location.href)}={}){
    const response=await fetch(`${API_BASE}/api/donations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...details,returnUrl:new URL('return.html',resultBase).href,cancelUrl:new URL('cancel.html',resultBase).href})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.checkoutUrl)throw new Error(data.error||'Không tạo được liên kết thanh toán.');
    const checkout=new URL(data.checkoutUrl);
    if(checkout.protocol!=='https:')throw new Error('Liên kết thanh toán chưa hợp lệ. Vui lòng thử lại.');
    if(data.orderCode){
      const record=JSON.stringify({amount:details.amount,displayName:details.displayName||'',anonymous:details.anonymous,message:details.message||'',items:details.giftId?[{id:details.giftId,qty:details.giftQty}]:[],giftId:details.giftId||null,giftQty:details.giftQty||null,createdAt:new Date().toISOString()});
      const key='poet-donation-'+data.orderCode;
      try{sessionStorage.setItem(key,record);}catch{/* Private mode. */}
      try{localStorage.setItem(key,record);}catch{/* Private mode. */}
    }
    location.href=checkout.href;
  }
  window.POETCheckout={API_BASE,open};
})();

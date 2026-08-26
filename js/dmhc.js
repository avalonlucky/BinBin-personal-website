(() => {
  const transformButtons=[...document.querySelectorAll('[data-transform]')];
  const transformImages=[...document.querySelectorAll('[data-transform-image]')];
  const showTransform=index=>{transformButtons.forEach((button,i)=>{const active=i===index;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active))});transformImages.forEach((image,i)=>image.classList.toggle('is-active',i===index))};
  transformButtons.forEach((button,index)=>button.addEventListener('click',()=>showTransform(index)));
  const boothButtons=[...document.querySelectorAll('[data-booth]')];
  const boothImages=[...document.querySelectorAll('.dmhc-booth-stage img')];
  boothButtons.forEach((button,index)=>button.addEventListener('click',()=>{boothButtons.forEach((item,i)=>{const active=i===index;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))});boothImages.forEach((image,i)=>image.classList.toggle('is-active',i===index))}));
  const transformList=document.querySelector('.dmhc-transform-list');
  if(transformList&&matchMedia('(max-width:760px)').matches){transformList.addEventListener('scroll',()=>{const width=transformList.clientWidth;const index=Math.max(0,Math.min(transformButtons.length-1,Math.round(transformList.scrollLeft/width)));showTransform(index)},{passive:true})}
})();

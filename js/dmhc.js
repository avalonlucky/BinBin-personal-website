(() => {
  const hero=document.querySelector('[data-dmhc-hero]');
  const scroller=document.querySelector('main.page');
  if(hero&&scroller){
    const image=hero.querySelector('.dmhc-hero-stage img');
    const blackout=hero.querySelector('.dmhc-hero-blackout');
    const light=hero.querySelector('.dmhc-hero-light');
    const content=hero.querySelector('.dmhc-hero-content');
    const statement=hero.querySelector('.dmhc-hero-statement');
    const guide=hero.querySelector('.dmhc-hero-guide');
    const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    let frame=0;
    const paint=()=>{
      frame=0;
      if(reduce)return;
      const rect=hero.getBoundingClientRect();
      const total=Math.max(1,hero.offsetHeight-scroller.clientHeight);
      const progress=Math.min(1,Math.max(0,-rect.top/total));
      image.style.filter=`brightness(${.28+progress*.72})`;
      image.style.transform=`scale(${1.08-progress*.06})`;
      blackout.style.opacity=String(.5*(1-progress));
      light.style.opacity=String(progress);
      statement.style.opacity=String(Math.max(0,1-progress*2.2));
      statement.style.transform=`translate(-50%,calc(-50% - ${progress*18}px))`;
      content.style.opacity=String(Math.max(0,(progress-.3)/.44));
      content.style.transform=`translateY(${(1-progress)*22}px)`;
      guide.style.opacity=String(Math.max(0,1-progress*1.4));
    };
    const requestPaint=()=>{if(!frame)frame=requestAnimationFrame(paint)};
    paint();
    scroller.addEventListener('scroll',requestPaint,{passive:true});
    addEventListener('resize',requestPaint,{passive:true});
  }
  const transformButtons=[...document.querySelectorAll('[data-transform]')];
  const transformImages=[...document.querySelectorAll('[data-transform-image]')];
  const showTransform=index=>{transformButtons.forEach((button,i)=>{const active=i===index;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active))});transformImages.forEach((image,i)=>image.classList.toggle('is-active',i===index))};
  transformButtons.forEach((button,index)=>button.addEventListener('click',()=>showTransform(index)));
  const boothButtons=[...document.querySelectorAll('[data-booth]')];
  const boothImages=[...document.querySelectorAll('.dmhc-booth-stage img')];
  boothButtons.forEach((button,index)=>button.addEventListener('click',()=>{boothButtons.forEach((item,i)=>{const active=i===index;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))});boothImages.forEach((image,i)=>image.classList.toggle('is-active',i===index))}));
  const transformList=document.querySelector('.dmhc-transform-list');
  if(transformList&&matchMedia('(max-width:760px)').matches){transformList.addEventListener('scroll',()=>{const width=transformList.clientWidth;const index=Math.max(0,Math.min(transformButtons.length-1,Math.round(transformList.scrollLeft/width)));showTransform(index)},{passive:true})}
  document.querySelectorAll('[data-compare]').forEach(compare=>{
    const input=compare.querySelector('input');
    const stage=compare.querySelector('.dmhc-compare-stage');
    const after=compare.querySelector('.dmhc-compare-stage>div');
    const line=compare.querySelector('.dmhc-compare-stage>i');
    if(!input||!stage||!after||!line)return;
    const paint=()=>{after.style.width=`${input.value}%`;after.querySelector('img').style.width=`${stage.clientWidth}px`;line.style.left=`${input.value}%`};
    const setFromPointer=event=>{const rect=stage.getBoundingClientRect();input.value=String(Math.round(Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width))*100));paint()};
    let dragging=false;
    stage.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')return;dragging=true;stage.setPointerCapture(event.pointerId);setFromPointer(event)});
    stage.addEventListener('pointermove',event=>{if(dragging)setFromPointer(event)});
    stage.addEventListener('pointerup',()=>{dragging=false});
    stage.addEventListener('pointercancel',()=>{dragging=false});
    input.addEventListener('keydown',event=>{
      const current=Number(input.value);
      let next=current;
      if(event.key==='ArrowLeft'||event.key==='ArrowDown')next=current-1;
      else if(event.key==='ArrowRight'||event.key==='ArrowUp')next=current+1;
      else if(event.key==='Home')next=Number(input.min);
      else if(event.key==='End')next=Number(input.max);
      else return;
      event.preventDefault();
      input.value=String(Math.min(Number(input.max),Math.max(Number(input.min),next)));
      paint();
    });
    input.addEventListener('input',paint);paint();
    addEventListener('resize',paint,{passive:true});
  });
  const archiveButtons=[...document.querySelectorAll('[data-archive-filter]')];
  const archiveItems=[...document.querySelectorAll('.dmhc-archive [data-kind]')];
  archiveButtons.forEach(button=>button.addEventListener('click',()=>{
    archiveButtons.forEach(item=>item.classList.toggle('is-active',item===button));
    archiveItems.forEach(item=>item.hidden=button.dataset.archiveFilter!=='all'&&item.dataset.kind!==button.dataset.archiveFilter);
  }));
})();

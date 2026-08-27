(() => {
  const hero=document.querySelector('[data-dmhc-hero]');
  const scroller=document.querySelector('main.page');
  if(scroller){
    const lockPageX=()=>{if(scroller.scrollLeft!==0)scroller.scrollLeft=0};
    lockPageX();
    scroller.addEventListener('scroll',lockPageX,{passive:true});
  }
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
  document.querySelectorAll('[data-compare-group]').forEach(group=>{
    const switcher=group.previousElementSibling;
    const buttons=[...(switcher?.querySelectorAll('[data-compare-switch]')||[])];
    const cards=[...group.querySelectorAll('.dmhc-compare-card')];
    buttons.forEach((button,index)=>button.addEventListener('click',()=>{
      buttons.forEach((item,i)=>{const active=i===index;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active))});
      cards.forEach((card,i)=>card.classList.toggle('is-active',i===index));
    }));
  });
  document.querySelectorAll('[data-compare]').forEach(compare=>{
    const input=compare.querySelector('input');
    const stage=compare.querySelector('.dmhc-compare-stage');
    if(!input||!stage)return;
    let paintFrame=0;
    const paint=()=>{
      paintFrame=0;
      compare.style.setProperty('--compare-pos',`${input.value}%`);
    };
    const requestPaint=()=>{if(!paintFrame)paintFrame=requestAnimationFrame(paint)};
    const setFromPointer=event=>{
      const rect=stage.getBoundingClientRect();
      const value=Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width))*100;
      input.value=value.toFixed(1);
      requestPaint();
    };
    let dragging=false;
    stage.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      dragging=true;
      stage.setPointerCapture(event.pointerId);
      setFromPointer(event);
    });
    stage.addEventListener('pointermove',event=>{if(dragging)setFromPointer(event)});
    stage.addEventListener('pointerup',event=>{dragging=false;if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId)});
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
      requestPaint();
    });
    input.addEventListener('input',requestPaint);paint();
  });
  const archiveSection=document.querySelector('.dmhc-archive-section');
  const finalSection=document.querySelector('.dmhc-final');
  if(archiveSection&&finalSection){
    archiveSection.parentNode.insertBefore(finalSection,archiveSection);
    const finalNav=document.querySelector(`.cs-toc a[href="#${finalSection.id}"]`)?.parentElement;
    const archiveNav=document.querySelector(`.cs-toc a[href="#${archiveSection.id}"]`)?.parentElement;
    if(finalNav&&archiveNav)archiveNav.parentNode.insertBefore(finalNav,archiveNav);
  }
  const archiveExperience=document.querySelector('[data-archive-experience]');
  if(archiveExperience&&scroller){
    const viewport=archiveExperience.querySelector('.dmhc-archive-viewport');
    const wall=archiveExperience.querySelector('.dmhc-archive-wall');
    const figures=[...archiveExperience.querySelectorAll('figure')];
    const lead=archiveExperience.querySelector('[data-archive-lead]');
    const mobile=matchMedia('(max-width:760px)');
    const reduce=matchMedia('(prefers-reduced-motion:reduce)');
    let endScale=1;
    let startX=0;
    let startY=0;
    let frame=0;
    const clamp=value=>Math.min(1,Math.max(0,value));
    const reset=()=>{
      wall.style.transform='';
      wall.style.transformOrigin='';
      wall.style.width='';
      figures.forEach(figure=>{figure.style.transform='';figure.style.opacity='';figure.style.zIndex='';figure.style.order=''});
      archiveExperience.style.removeProperty('--archive-height');
      archiveExperience.style.removeProperty('--archive-caption');
    };
    const measure=()=>{
      reset();
      if(mobile.matches||reduce.matches||!viewport||!wall||!lead)return;
      const ordered=figures.filter(figure=>figure!==lead);
      ordered.splice(Math.min(17,ordered.length),0,lead);
      ordered.forEach((figure,index)=>figure.style.order=String(index));
      const viewportWidth=viewport.clientWidth;
      const viewportHeight=viewport.clientHeight;
      if(!viewportWidth||!viewportHeight)return;
      wall.style.width=`${viewportWidth}px`;
      const leadWidth=lead.offsetWidth;
      const leadHeight=lead.offsetHeight;
      if(!leadWidth||!leadHeight)return;
      const expansion=Math.max(1,Math.max(viewportWidth/leadWidth,viewportHeight/leadHeight)*1.02);
      wall.style.width=`${viewportWidth*expansion}px`;
      endScale=1/expansion;
      startX=wall.offsetWidth/2-(lead.offsetLeft+lead.offsetWidth/2);
      startY=wall.offsetHeight/2-(lead.offsetTop+lead.offsetHeight/2);
      paint();
    };
    const paint=()=>{
      frame=0;
      if(mobile.matches||reduce.matches||!endScale)return;
      const rect=archiveExperience.getBoundingClientRect();
      const travel=Math.max(1,archiveExperience.offsetHeight-viewport.clientHeight);
      const progress=clamp(-rect.top/travel);
      const reveal=1-Math.pow(1-progress,2.2);
      const scale=1+(endScale-1)*reveal;
      const x=startX*(1-reveal);
      const y=startY*(1-reveal);
      wall.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${scale.toFixed(4)})`;
      archiveExperience.style.setProperty('--archive-caption',String(clamp((reveal-.82)/.18)));
    };
    const requestPaint=()=>{if(!frame)frame=requestAnimationFrame(paint)};
    const requestMeasure=()=>requestAnimationFrame(measure);
    addEventListener('load',requestMeasure,{once:true});
    addEventListener('resize',requestMeasure,{passive:true});
    scroller.addEventListener('scroll',requestPaint,{passive:true});
    if('ResizeObserver'in window)new ResizeObserver(requestMeasure).observe(wall);
    if(lead.querySelector('img')?.complete)requestMeasure();
  }
})();

(()=>{
  const links=[...document.querySelectorAll('.light-sidebar nav a')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const updateNav=()=>{
    let active=sections[0];
    for(const section of sections){if(section.getBoundingClientRect().top<innerHeight*.42)active=section}
    links.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===`#${active.id}`));
  };
  addEventListener('scroll',updateNav,{passive:true});updateNav();

  const wheel=document.querySelector('[data-skill-wheel]');
  const track=document.querySelector('[data-skill-track]');
  const wheelViewport=wheel?.querySelector('.skill-wheel-viewport');
  const skillTitle=document.querySelector('[data-skill-title]');
  const skillCopy=document.querySelector('[data-skill-copy]');
  const skills=[
    ['信息设计','把专业、密集的技术内容重新组织成可阅读、可传播的视觉结构。'],
    ['视觉系统','让不同媒介共享一套清晰骨架，同时保留各自的识别与用途。'],
    ['品牌视觉','从识别、版式到传播触点，建立稳定而有辨识度的品牌表达。'],
    ['空间叙事','把墙面、灯箱与参观动线编排成有次序的信息体验。'],
    ['展会设计','围绕真实参观者与业务目标，组织展板、物料和现场视觉。'],
    ['AI 工作流','用 AI 加速提炼与视觉探索，最终判断和设计责任仍由我完成。'],
    ['落地统筹','从设计评审、制作文件到现场核对，确保最后呈现不走样。'],
    ['跨部门协作','与技术、销售、品宣和供应商共同推进，把需求变成可执行结果。']
  ];

  if(wheel&&wheelViewport&&track&&skillTitle&&skillCopy){
    const copies=3;
    const items=[];
    for(let cycle=0;cycle<copies;cycle+=1){
      skills.forEach(([label],skillIndex)=>{
        const item=document.createElement('button');
        item.type='button';
        item.className='skill-wheel-item';
        item.textContent=label;
        item.dataset.skillIndex=skillIndex;
        item.setAttribute('aria-label',`查看${label}`);
        track.appendChild(item);
        items.push(item);
      });
    }

    let current=0;
    let offset=0;
    let pointerDown=false;
    let dragging=false;
    let startY=0;
    let pressedSkill=null;
    let lastCommitted=0;
    let wheelAccumulator=0;
    const step=12;
    const radius=128;

    const wrapIndex=value=>((value%skills.length)+skills.length)%skills.length;
    const updateCopy=next=>{
      const changed=next!==lastCommitted;
      lastCommitted=next;
      if(changed){
        skillTitle.parentElement.classList.remove('is-revealing');
        requestAnimationFrame(()=>skillTitle.parentElement.classList.add('is-revealing'));
      }
      skillTitle.textContent=skills[next][0];
      skillCopy.textContent=skills[next][1];
    };

    const render=()=>{
      const height=wheel.clientHeight||364;
      const activeSlot=skills.length+current;
      const centerY=height/2;
      const centerX=64-radius;
      items.forEach((item,itemIndex)=>{
        const slotDiff=itemIndex-activeSlot;
        const angle=slotDiff*step-offset;
        const radians=angle*Math.PI/180;
        const distance=Math.abs(angle)/step;
        const x=centerX+radius*Math.cos(radians);
        const y=centerY+radius*Math.sin(radians)-13;
        item.style.left=`${x.toFixed(1)}px`;
        item.style.top=`${y.toFixed(1)}px`;
        item.style.transform=`rotate(${angle.toFixed(2)}deg)`;
        item.style.opacity=distance<.5?'1':String(Math.max(.12,.46-distance*.055));
        item.style.filter=distance<.6?'none':`blur(${Math.min(5,Math.max(0,distance-1)).toFixed(1)}px)`;
        item.style.fontWeight=distance<.5?'600':'400';
        item.style.visibility=Math.abs(angle)>70?'hidden':'visible';
        item.classList.toggle('is-active',distance<.5);
        item.tabIndex=Math.abs(angle)<49?0:-1;
      });
    };

    const commit=rawSteps=>{
      const steps=Math.round(rawSteps);
      if(!steps){offset=0;render();return}
      current=wrapIndex(current+steps);
      offset=0;
      updateCopy(current);
      render();
    };

    const select=target=>{
      let difference=target-current;
      if(difference>skills.length/2)difference-=skills.length;
      if(difference<-skills.length/2)difference+=skills.length;
      if(!difference)return;
      offset=difference*step;
      render();
      window.setTimeout(()=>commit(difference),180);
    };

    track.addEventListener('click',event=>{
      if(event.detail!==0)return;
      const item=event.target.closest('.skill-wheel-item');
      if(item)select(Number(item.dataset.skillIndex));
    });
    wheelViewport.addEventListener('wheel',event=>{
      event.preventDefault();
      wheelAccumulator+=event.deltaY;
      if(Math.abs(wheelAccumulator)<34)return;
      select(wrapIndex(current+(wheelAccumulator>0?1:-1)));
      wheelAccumulator=0;
    },{passive:false});
    wheelViewport.addEventListener('pointerdown',event=>{
      pointerDown=true;dragging=false;startY=event.clientY;offset=0;
      pressedSkill=event.target.closest('.skill-wheel-item');
    });
    wheelViewport.addEventListener('pointermove',event=>{
      if(!pointerDown)return;
      const delta=event.clientY-startY;
      if(Math.abs(delta)>4)dragging=true;
      if(!dragging)return;
      const pixelsPerStep=radius*Math.sin(step*Math.PI/180);
      offset=-delta/pixelsPerStep*step;
      render();
    });
    const endDrag=()=>{
      if(!pointerDown)return;
      pointerDown=false;
      if(dragging)commit(offset/step);
      else if(pressedSkill)select(Number(pressedSkill.dataset.skillIndex));
      dragging=false;
      pressedSkill=null;
    };
    wheelViewport.addEventListener('pointerup',endDrag);
    wheelViewport.addEventListener('pointercancel',endDrag);
    addEventListener('resize',render,{passive:true});
    updateCopy(current);
    render();
  }

  const testimonial=document.querySelector('[data-testimonial]');
  if(testimonial){
    const testimonials=[
      ['Craig Newborn','Former CEO, PayJustNow','CN','“The work here brings together a sharp eye for design and a calm, thoughtful approach to digital experience.”'],
      ['Donna Blackwell-Kopotic','Sims Lifecycle Service (US)','DB','“Maridian Space feels like a living archive of ideas, experiments, and craft, with each detail handled intentionally.”'],
      ['Colleen Harrison','Former Head of Marketing, Payfast','CH','“The projects show a strong sense of visual direction, product thinking, and curiosity about what technology can become.”'],
      ['Jason Bagley','Founder and CEO, Growth Experts (US)','JB','“There is a quiet precision to the work, where complex ideas are shaped into clear and expressive digital moments.”'],
      ['Anton Van Diermen','Director and Co-Founder, Zulik','AV','“A thoughtful personal space with a distinctive point of view across design, AI, and creative practice.”']
    ];
    const name=testimonial.querySelector('[data-testimonial-name]');
    const role=testimonial.querySelector('[data-testimonial-role]');
    const avatar=testimonial.querySelector('[data-testimonial-avatar]');
    const quote=testimonial.querySelector('[data-testimonial-quote]');
    const prev=testimonial.querySelector('[data-testimonial-prev]');
    const next=testimonial.querySelector('[data-testimonial-next]');
    const dots=testimonial.querySelector('[data-testimonial-dots]');
    let active=0;
    let changing=false;
    testimonials.forEach((entry,dotIndex)=>{
      const dot=document.createElement('button');
      dot.type='button';dot.className='light-testimonial-dot';
      dot.setAttribute('aria-label',`查看第 ${dotIndex+1} 条评价`);
      dot.addEventListener('click',()=>show(dotIndex));
      dots.appendChild(dot);
    });
    const render=()=>{
      const [person,job,initials,text]=testimonials[active];
      name.textContent=person;role.textContent=job;avatar.textContent=initials;quote.textContent=text;
      prev.disabled=active===0;next.disabled=active===testimonials.length-1;
      [...dots.children].forEach((dot,dotIndex)=>dot.classList.toggle('is-active',dotIndex===active));
    };
    function show(nextIndex){
      if(changing||nextIndex===active||nextIndex<0||nextIndex>=testimonials.length)return;
      changing=true;testimonial.classList.add('is-changing');
      window.setTimeout(()=>{
        active=nextIndex;render();testimonial.classList.remove('is-changing');changing=false;
      },190);
    }
    prev.addEventListener('click',()=>show(active-1));
    next.addEventListener('click',()=>show(active+1));
    render();
  }
})();

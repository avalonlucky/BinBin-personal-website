(()=>{
  const links=[...document.querySelectorAll('.light-sidebar nav a')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const updateNav=()=>{
    let active=sections[0];
    for(const section of sections){if(section.getBoundingClientRect().top<innerHeight*.42)active=section}
    links.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===`#${active.id}`));
  };
  addEventListener('scroll',updateNav,{passive:true});updateNav();

  const stage=document.querySelector('[data-skill-stage]');
  const title=document.querySelector('[data-skill-title]');
  const copy=document.querySelector('[data-skill-copy]');
  const skills=[
    ['信息设计','把专业、密集的技术内容重新组织成可阅读、可传播的视觉结构。'],
    ['视觉系统','让不同媒介共享一套清晰骨架，同时保留各自的识别与用途。'],
    ['空间叙事','把墙面、灯箱与参观动线编排成有次序的信息体验。'],
    ['落地统筹','从设计评审、制作文件到现场核对，确保最后呈现不走样。']
  ];
  let index=0;
  stage?.addEventListener('click',()=>{index=(index+1)%skills.length;title.textContent=skills[index][0];copy.textContent=skills[index][1]});
})();

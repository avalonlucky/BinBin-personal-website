(() => {
  const ASSET = '/assets/creative-desktop/legacy';
  const openModal = el => { if (!el) return; el.classList.add('open'); el.style.display = 'flex'; };
  const closeModal = el => { if (!el) return; el.classList.remove('open'); el.style.display = 'none'; };
  const bindClose = (modal, btn) => {
    btn?.addEventListener('click', () => closeModal(modal));
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
  };

  /* ---------- My Shelf ---------- */
  const BOOKS = [
    { title: 'Gone with the Wind', sub: 'Margaret Mitchell · 1936', img: `${ASSET}/library/book-gone-with-the-wind.jpg` },
    { title: 'My Brilliant Friend', sub: 'Elena Ferrante · 2012', img: `${ASSET}/library/book-my-brilliant-friend.jpg`, isbn: '1609450787' },
    { title: 'Martyr!', sub: 'Kaveh Akbar · 2024', img: `${ASSET}/library/book-martyr.jpg` }
  ];
  const FILMS = [
    { title: 'The Odyssey', sub: 'Christopher Nolan · 2026', poster: `${ASSET}/library/film-the-odyssey.jpg` }
  ];
  const TV = [
    { title: 'Game of Thrones', sub: 'HBO · 2011', poster: `${ASSET}/library/tv-game-of-thrones.jpg` },
    { title: 'Planet Earth', sub: 'BBC · 2006', poster: `${ASSET}/library/tv-planet-earth.jpg` }
  ];
  const ARTISTS = [
    { title: "L'Impératrice", sub: 'french nu-disco', img: `${ASSET}/library/artist-limperatrice.jpg` },
    { title: 'Parcels', sub: 'australian disco-pop', img: `${ASSET}/library/artist-parcels.jpg` },
    { title: 'Peggy Gou', sub: 'korean house', img: `${ASSET}/library/artist-peggy-gou.jpg` },
    { title: 'Daft Punk', sub: 'french electronic', img: `${ASSET}/library/artist-daft-punk.jpg` }
  ];
  const ARCHIVE = [
    { title: 'Breaking Bad', sub: 'AMC · 2008' },
    { title: 'Bugonia', sub: 'Yorgos Lanthimos · 2025' },
    { title: 'Dune: Part One', sub: 'Denis Villeneuve · 2021' },
    { title: 'Dune: Part Two', sub: 'Denis Villeneuve · 2024' }
  ];

  function renderShelf() {
    const body = document.getElementById('cmBody');
    const ITEMS = [
      ...BOOKS.map(b => ({ group: 'reading', kind: 'Book', title: b.title, sub: b.sub, img: b.img })),
      ...TV.map(t => ({ group: 'watching', kind: 'Television', title: t.title, sub: t.sub, img: t.poster })),
      ...FILMS.map(f => ({ group: 'watching', kind: 'Film', title: f.title, sub: f.sub, img: f.poster })),
      ...ARTISTS.map(a => ({ group: 'listening', kind: 'Artist', title: a.title, sub: a.sub, img: a.img }))
    ];
    body.innerHTML = `
      <div class="msh">
        <div class="msh-rail" id="mshRail">${ITEMS.map((it, i) => `
          <button type="button" class="msh-item" data-i="${i}" title="${it.title}">
            <img src="${it.img}" ${it.fallback ? `onerror="this.onerror=null;this.src='${it.fallback}'"` : ''} alt="${it.title}" loading="lazy">
          </button>`).join('')}
        </div>
        <div class="msh-detail" id="mshDetail"></div>
        <div class="msh-foot">
          <form class="ms-suggest" id="msSuggest">
            <label for="msSuggestInput">got a suggestion?</label>
            <div class="ms-suggest-row">
              <input id="msSuggestInput" type="text" placeholder="a book, show, artist, or article…" maxlength="140" autocomplete="off">
              <button type="submit">add</button>
            </div>
            <div class="ms-suggest-note" id="msSuggestNote"></div>
          </form>
          <div class="ms-lists">
            <div class="ms-tabs" role="tablist">
              <button type="button" class="ms-tab is-active" data-tab="suggestions">community suggestions <span class="count" id="msSuggestCount"></span></button>
              <button type="button" class="ms-tab" data-tab="archive">archive <span class="count">(${ARCHIVE.length})</span></button>
            </div>
            <ul class="ms-panel ms-suggest-list" id="msSuggestList" data-panel="suggestions"><li class="ms-empty">no suggestions yet — be the first.</li></ul>
            <ul class="ms-panel ms-archive-list" data-panel="archive" hidden>${ARCHIVE.map(a => `<li><span>${a.title}</span><span class="who">${a.sub}</span></li>`).join('')}</ul>
          </div>
        </div>
      </div>`;
    const tiles = [...body.querySelectorAll('.msh-item')];
    const detail = body.querySelector('#mshDetail');
    const select = el => {
      tiles.forEach(t => t.classList.toggle('is-active', t === el));
      const it = ITEMS[Number(el.dataset.i)];
      detail.innerHTML = `<div class="msh-d-kind">${it.kind}</div><div class="msh-d-title">${it.title}</div><div class="msh-d-sub">${it.sub}</div>`;
    };
    tiles.forEach(t => t.addEventListener('click', () => select(t)));
    if (tiles[0]) select(tiles[0]);
    const tabs = [...body.querySelectorAll('.ms-tab')];
    const panels = [...body.querySelectorAll('.ms-panel')];
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.toggle('is-active', t === tab));
      panels.forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    }));
    const form = body.querySelector('#msSuggest');
    const list = body.querySelector('#msSuggestList');
    const countEl = body.querySelector('#msSuggestCount');
    const stored = JSON.parse(localStorage.getItem('desk-shelf-suggestions') || '[]');
    // Suggestions are persisted in localStorage, so treat every stored value as
    // untrusted text. Building the rows with textContent prevents a suggestion
    // from being interpreted as markup when the shelf is opened again.
    const paint = rows => {
      list.replaceChildren();
      if (!rows.length) {
        const empty = document.createElement('li');
        empty.className = 'ms-empty';
        empty.textContent = 'no suggestions yet — be the first.';
        list.append(empty);
      } else {
        rows.forEach(row => {
          const item = document.createElement('li');
          const body = document.createElement('span');
          body.textContent = String(row?.body || '');
          item.append(body);
          if (row?.name) {
            const name = document.createElement('span');
            name.className = 'who';
            name.textContent = `— ${String(row.name)}`;
            item.append(name);
          }
          list.append(item);
        });
      }
      countEl.textContent = rows.length ? `(${rows.length})` : '';
    };
    paint(stored);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const val = form.querySelector('#msSuggestInput').value.trim().slice(0, 140);
      if (!val) return;
      stored.unshift({ body: val });
      localStorage.setItem('desk-shelf-suggestions', JSON.stringify(stored.slice(0, 40)));
      form.querySelector('#msSuggestInput').value = '';
      form.querySelector('#msSuggestNote').textContent = 'thanks! it’ll appear on the list.';
      paint(stored);
    });
  }

  const PHOTOS = [
    ['c1f3604a-9c67-4a9a-9ad3-dd6284c5fc31/photo-sunflower-v2.png', 'sunflowers.jpg', 'North Dakota'],
    ['83250b2e-2de8-4575-81eb-7284e4b5d804/photo-botanical_garden.png', 'botanical_garden.jpg', 'NYBG'],
    ['5f7e6c8f-3b3e-4c94-adba-ea44e20c274e/photo-golden_gate.png', 'golden_gate.jpg', 'San Francisco'],
    ['e3b7e125-3f95-4ee9-89e3-7efe55d8ca0e/photo-4th_of_july.png', 'fourth_of_july.jpg', 'Minneapolis'],
    ['fae56235-59de-4558-98fc-cec0656f099b/photo-hawaii_tree2.png', 'palm_tree.jpg', 'Maui HI'],
    ['f41fee25-87b8-4532-b22b-d434f5ffbaa5/photo-cat_sf.png', 'street_cat.jpg', 'San Francisco'],
    ['9d169720-5307-44f4-a3c3-a59a5b14dec8/photo-meadows.png', 'meadows.jpg', 'Minnesota'],
    ['ec9df530-245c-4544-a7f0-0bd92b7a1d5c/photo-snorkel.png', 'snorkeling.jpg', 'Maui HI'],
    ['8b61832f-a9f7-43cc-afea-3a6d0a3088b0/photo-mountain.png', 'mountain.jpg', 'Boulder CO'],
    ['90341329-e9e4-4924-a8c2-9961da38b618/photo-pottery.png', 'pottery.jpg', 'Minnesota'],
    ['c853ed60-2ceb-48ef-a11b-68fc47bf6d9b/photo-nyc.png', 'rockefeller.jpg', 'NYC'],
    ['4269cf58-b3d2-41bf-ba3b-6bfcb980c1d0/photo-crimepunishment.png', 'reading.jpg', 'Dostoevsky'],
    ['d3003c28-388a-46da-8495-1d83c8b6cf5a/photo-cave.png', 'sea_cave.jpg', 'Hawaii'],
    ['a80446dc-f741-4dad-8f70-f321afcca535/photo-joshua.png', 'joshua_tree.jpg', 'Mojave'],
    ['07a47736-9e99-4ca5-86b8-a4067891aefa/photo-kitten.jpg', 'kit-kat.jpg', 'Backyard'],
    ['67a61281-2f54-4276-a130-58afae1507dd/photo-festival-v2.png', 'music_festival.jpg', 'Wisconsin'],
    ['308f289d-28aa-4634-829a-c911ec4224ea/photo-scuba.jpg', 'scuba.jpg', 'Maui HI'],
    ['a6275ffa-ef56-4e92-ae36-9eacf70fa3b3/photo-iceland.png', 'cliffside.jpg', 'Iceland'],
    ['c5a70798-7f25-4354-97cc-d54e8917db4c/photo-lagoon-v2.png', 'blue_lagoon.jpg', 'Iceland'],
    ['6c23a98d-2717-40d0-82e5-f6376efa0b04/photo-karate.png', 'karate.jpg', 'Green Belt'],
    ['d2de58f5-464a-4484-ab20-3e38d519de60/photo-climb.png', 'bouldering.jpg', 'Minnesota'],
    ['a6b19239-56c4-491c-9759-4989c8655652/photo-eiffel.png', 'eiffel_tower.jpg', 'Paris'],
    ['b2389bff-1e92-416d-9d31-aeca369b32a0/photo-barcelona.png', 'arc_de_triomf.jpg', 'Barcelona'],
    ['8ba14587-1849-457a-8ad7-e9d8b91d5882/photo-grandcanyon.png', 'grand_canyon.jpg', 'Arizona'],
    ['d5682fd0-3d56-4004-8a2f-9172c4c92603/photo-maui-beach.png', 'moonrise.jpg', 'Maui HI'],
    ['c188ad23-6b05-48c0-9d91-689455889007/photo-waterfalls.png', 'wall_of_tears.jpg', 'Maui HI'],
    ['ec9c7aa1-fba3-4fa2-a7a6-d552b199040d/photo-clouds-v2.png', 'cotton_sky.jpg', 'Golden hour'],
    ['3b07bfd4-bb64-4944-8397-f1ae5963e13e/photo-seljalandsfoss.png', 'seljalandsfoss.jpg', 'Iceland']
  ].map(([path, title, sub]) => ({ src: `${ASSET}/${path}`, title, sub }));

  function openPhotoLightbox(items, startIdx) {
    document.getElementById('iosLightbox')?.remove();
    const lb = document.createElement('div');
    lb.id = 'iosLightbox';
    lb.className = 'ios-lightbox open';
    lb.innerHTML = `
      <div class="ios-lb-top">
        <button type="button" class="ios-lb-close">✕ Close</button>
        <span class="ios-lb-count"></span>
        <span style="width:56px"></span>
      </div>
      <div class="ios-lb-stage">${items.map(p => `<div class="ios-lb-slide"><img src="${p.src}" alt="${p.title}"></div>`).join('')}</div>
      <div class="ios-lb-strip">${items.map((p, i) => `<div class="ios-lb-thumb" data-idx="${i}"><img src="${p.src}" alt=""></div>`).join('')}</div>`;
    document.body.appendChild(lb);
    const stage = lb.querySelector('.ios-lb-stage');
    const count = lb.querySelector('.ios-lb-count');
    const thumbs = [...lb.querySelectorAll('.ios-lb-thumb')];
    const setActive = i => {
      count.textContent = `${i + 1} of ${items.length}`;
      thumbs.forEach((t, idx) => t.classList.toggle('active', idx === i));
    };
    requestAnimationFrame(() => { stage.scrollLeft = stage.clientWidth * startIdx; setActive(startIdx); });
    stage.addEventListener('scroll', () => setActive(Math.round(stage.scrollLeft / stage.clientWidth)));
    thumbs.forEach(t => t.addEventListener('click', () => stage.scrollTo({ left: stage.clientWidth * Number(t.dataset.idx), behavior: 'smooth' })));
    lb.querySelector('.ios-lb-close').addEventListener('click', () => lb.remove());
  }

  function renderPhotos() {
    const body = document.getElementById('cmBody');
    body.innerHTML = `
      <div class="ios-photos">
        <div class="ios-photos-head">
          <div class="ios-photos-title">Library</div>
          <div class="ios-photos-sub">${PHOTOS.length} items</div>
        </div>
        <div class="ios-photos-grid">${PHOTOS.map((p, i) => `
          <div class="ios-photo" data-idx="${i}" title="${p.title}"><img src="${p.src}" alt="${p.title}" loading="lazy"></div>`).join('')}
        </div>
        <div class="ios-photos-tabs">
          <div class="ios-tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/></svg><span>Library</span></div>
          <div class="ios-tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2.5"/></svg><span>Collections</span></div>
        </div>
      </div>`;
    body.querySelectorAll('.ios-photo').forEach(el => {
      el.addEventListener('click', () => openPhotoLightbox(PHOTOS, Number(el.dataset.idx)));
    });
  }

  const collectionModal = document.getElementById('collectionModal');
  bindClose(collectionModal, document.getElementById('cmClose'));
  function openCollection(kind) {
    const title = document.getElementById('cmTitle');
    if (kind === 'photos') { title.textContent = 'Photos'; renderPhotos(); }
    else { title.textContent = 'My Shelf'; renderShelf(); }
    openModal(collectionModal);
  }

  /* ---------- Resume ---------- */
  const previewModal = document.getElementById('previewModal');
  bindClose(previewModal, document.getElementById('pvClose'));
  function openResume() {
    previewModal.classList.add('resume-preview');
    document.getElementById('pvFilename').textContent = 'resume.pdf';
    document.getElementById('pvImg').src = `${ASSET}/bb729e37-05b2-4eac-9f41-fce42724fcf4/resume-page-v11.png`;
    document.getElementById('pvTitle').textContent = 'resume.pdf';
    document.getElementById('pvSub').textContent = 'Parinaz Kassemi · Senior Product Designer';
    document.getElementById('pvPdf').style.display = 'inline-block';
    document.getElementById('pvMeta').innerHTML = [
      ['Kind', 'PDF Document'],
      ['Size', '1 MB'],
      ['Where', 'Desktop'],
      ['Modified', 'Jul 2026']
    ].map(([k, v]) => `<div style="color:#8a8a90;text-align:right">${k}</div><div>${v}</div>`).join('');
    openModal(previewModal);
  }

  /* ---------- Notebook ---------- */
  const notes = {
    philosophy: {
      title: 'philosophy.md',
      heading: 'A Design Philosophy',
      dek: 'Understanding first. Craft as care. Curiosity as a practice.',
      date: 'Note 02',
      body: `<p>I believe <strong>understanding is the foundation of good design</strong>. The more deeply we understand a problem, the more naturally the solution reveals itself.</p>
        <p>That's why I ask questions before proposing answers, study before simplifying, and research before designing. It's also why I'm drawn to complex systems — AI, enterprise products, information architecture, visual communication.</p>
        <p>I care deeply about craft because <strong>clarity deserves care</strong>. Every interaction, every visual decision, every detail shapes whether someone feels confused or confident.</p>
        <p>I'm inspired by people who build. People who stay curious. People who see change as an invitation to learn rather than something to resist.</p>
        <p>Ultimately, I hope to leave every product, team, and system a little more thoughtful, a little more intuitive, and a little easier to understand.</p>`
    },
    values: {
      title: 'values.md',
      heading: 'What I Work By',
      dek: 'Seven notes on craft, curiosity, and leaving systems better.',
      date: 'Note 03',
      body: `<h4>what guides my work</h4>
        <p><strong>Stay curious.</strong> The best ideas begin with good questions. Understanding comes before execution.</p>
        <p><strong>Seek understanding before solutions.</strong> Every product is a system. My job is to understand how it works, where it breaks, and how it can become more intuitive.</p>
        <p><strong>Design with intention.</strong> Every detail communicates something. Visuals, motion, language, and structure should work together to help people understand — not distract them.</p>
        <p><strong>Craft is a lifelong practice.</strong> Great work comes from continuously refining your judgment.</p>
        <p><strong>Build instead of complain.</strong> I'm drawn to people who notice problems and choose to improve them.</p>
        <p><strong>Adapt with curiosity.</strong> Technology will keep changing. Understand it, experiment with it, use it thoughtfully.</p>
        <p><strong>Leave every system better than you found it.</strong> Create clarity. Strengthen the foundation.</p>`
    },
    ai: {
      title: 'artificial_intelligence.md',
      heading: 'Thoughts on AI',
      dek: 'The question is not whether AI can design. It is which parts of the job require a designer.',
      date: 'Note 01',
      body: `<p>Design is one of the few functions that ends up touching almost every other function.</p>
        <p>The job changes because of that.</p>
        <p>Visual craft is the baseline. The rest is communication, alignment, judgment, and making decisions under ambiguity.</p>
        <p><strong>A lot of the work is translation.</strong></p>
        <p>Business goals into product decisions. Engineering constraints into tradeoffs. Research into something a team can act on.</p>
        <p><strong>The AI conversation mostly misses this.</strong></p>
        <p>The question is not whether AI can design. It is which parts of the job require a designer.</p>
        <p>Documentation does not. Meeting summaries do not. First drafts usually do not.</p>
        <p><strong>Judgment does.</strong> Knowing which problem matters does. Making the right tradeoff does. Recognizing when the obvious solution is wrong does.</p>`
    }
  };
  const notebookModal = document.getElementById('notebookModal');
  const nbFrame = notebookModal?.querySelector('.nb-frame');
  function renderNote(key) {
    const n = notes[key] || notes.ai;
    document.getElementById('nbTitle').textContent = n.heading;
    document.getElementById('nbContent').innerHTML = (n.dek ? `<p class="nb-dek">${n.dek}</p>` : '') + n.body + '<p class="nb-end">· · ·</p>';
    document.getElementById('nbDate').innerHTML = `<span>${n.date}</span><span>${n.title}</span>`;
    notebookModal.querySelectorAll('.nb-item').forEach(b => b.classList.toggle('active', b.dataset.note === key));
  }
  notebookModal?.querySelectorAll('.nb-item').forEach(b => {
    b.addEventListener('click', () => { renderNote(b.dataset.note); nbFrame?.setAttribute('data-view', 'note'); });
  });
  document.getElementById('notebookBack')?.addEventListener('click', () => nbFrame?.setAttribute('data-view', 'list'));
  bindClose(notebookModal, document.getElementById('notebookClose'));
  function openNotebook() {
    const mobile = window.matchMedia('(max-width:720px)').matches;
    nbFrame?.setAttribute('data-view', mobile ? 'list' : 'note');
    renderNote('ai');
    openModal(notebookModal);
  }

  /* ---------- Case studies ---------- */
  const CASES = {
    daydreamz: {
      num: 'Case 01',
      name: 'Daydreamz',
      sub: 'Self-Built Mobile Web App',
      kicker: 'Case 01 · 2026 · Product Experiment · jnpr.labs',
      hero: `${ASSET}/046cfd97-e84e-4019-b3e6-29d9110bdcab/dz-3797.jpg`,
      blurb: 'A mobile-only journaling app that grew out of watching how people behave in open digital spaces.',
      tags: ['Product Design', 'Figma', 'Built with Lovable', 'Mobile Web', '2026'],
      html: `
        <div class="cs-banner"><img src="${ASSET}/046cfd97-e84e-4019-b3e6-29d9110bdcab/dz-3797.jpg" alt=""></div>
        <div class="lc">
          <div class="lc-hero-kicker">Case 01 · 2026 · Product Experiment · jnpr.labs</div>
          <h1>Daydreamz</h1>
          <p class="lc-hero-sub">A mobile-only journaling app that grew out of watching how people behave in open digital spaces.</p>
        </div>
        <div class="cs-tags"><span class="cs-tag">Product Design</span><span class="cs-tag">Figma</span><span class="cs-tag">Built with Lovable</span><span class="cs-tag">Mobile Web</span></div>
        <div class="lc">
          <section class="lc-sec"><div class="lc-num">01 · Overview</div><h2 class="lc-h">A small app for one little thought a day.</h2>
            <p>Daydreamz is a mobile-first journaling app that asks you one small prompt a day. It is designed and built end to end in Figma and Lovable, and it is live at www.daydreamz.app.</p>
            <div class="lc-meta"><div><span>Role</span><strong>Product design, prototyping, build</strong></div><div><span>Stack</span><strong>Figma · Lovable · mobile web</strong></div><div><span>Status</span><strong>Live and in ongoing iteration</strong></div></div>
            <a class="dz-cta" href="https://www.daydreamz.app" target="_blank" rel="noopener">Open daydreamz.app →</a>
          </section>
          <section class="lc-sec"><div class="lc-num">02 · Where it started</div><h2 class="lc-h">Moderating this portfolio turned into a product idea.</h2>
            <p>This portfolio is an interactive desktop — people can leave sticky notes, drop stickers, and move through the space. Sitting in that moderation queue became an unexpected research method.</p>
          </section>
          <section class="lc-sec"><div class="lc-num">03 · The product</div><h2 class="lc-h">One little prompt a day.</h2>
            <p>Daydreamz opens with a single question and a soft yellow button. Answer it or do not. Then you can make the page yours: stickers, photos, songs, doodles.</p>
          </section>
        </div>`
    },
    ondemand: {
      num: 'Case 02',
      name: 'On Demand',
      sub: 'New Product Launch',
      kicker: 'Case 02 · 2024 · Life Time',
      hero: `${ASSET}/8fc80f6e-8032-4904-a9f0-5116d77aafc6/ondemand-IMG_3674.jpg`,
      blurb: 'Scaling a growing fitness content library.',
      tags: ['Product Strategy', 'UX Design', 'Research', '2024'],
      html: `
        <div class="cs-banner"><img src="${ASSET}/8fc80f6e-8032-4904-a9f0-5116d77aafc6/ondemand-IMG_3674.jpg" alt=""></div>
        <div class="lc">
          <div class="lc-hero-kicker">Case 02 · 2024 · Life Time</div>
          <h1>On Demand</h1>
          <p class="lc-hero-sub">Scaling a growing fitness content library.</p>
        </div>
        <div class="cs-tags"><span class="cs-tag">Product Strategy</span><span class="cs-tag">UX Design</span><span class="cs-tag">Research</span></div>
        <div class="lc">
          <section class="lc-sec"><div class="lc-num">01 · Overview</div><h2 class="lc-h">Hundreds of new classes, one endless feed.</h2>
            <p>Life Time's On Demand platform was rapidly expanding. Members were presented with a continuous feed of videos, making it increasingly difficult to discover relevant content as the library grew.</p>
            <div class="lc-meta"><div><span>Role</span><strong>Lead UX Designer</strong></div><div><span>Focus</span><strong>Product Strategy, UX Design, Research</strong></div><div><span>Year</span><strong>2024</strong></div></div>
          </section>
          <section class="lc-sec"><div class="lc-num">02 · The challenge</div><h2 class="lc-h">Browsing wasn't finding.</h2>
            <p>A single, continuously scrolling feed worked for a smaller library. It became the bottleneck as hundreds of new classes were added. The redesign introduced lightweight category filters first, then a longer-term discovery roadmap: search, sort, bookmarking, and a scalable information architecture.</p>
          </section>
        </div>`
    },
    laic: {
      num: 'Case 03',
      name: 'L·AI·C',
      sub: 'AI Chatbot',
      kicker: 'Case 03 · 2024 · Life Time',
      hero: '',
      blurb: 'Designing an AI concierge for a complex wellness ecosystem.',
      tags: ['Research', 'Strategy', 'Conversation Design', '2024'],
      html: `
        <div class="lc">
          <div class="lc-hero-kicker">Case 03 · 2024 · Life Time</div>
          <h1>L·AI·C</h1>
          <p class="lc-hero-sub">Designing an AI concierge for a complex wellness ecosystem.</p>
        </div>
        <div class="cs-tags"><span class="cs-tag">Research</span><span class="cs-tag">Strategy</span><span class="cs-tag">Conversation Design</span></div>
        <div class="lc">
          <section class="lc-sec"><div class="lc-num">01 · Overview</div><h2 class="lc-h">Hundreds of services. One hard question: where?</h2>
            <p>Life Time had evolved far beyond a traditional fitness app. Members could book classes, reserve childcare, shop, and access hundreds of services — all within a single experience. Discovering information became increasingly difficult, resulting in high volumes of repetitive concierge questions.</p>
            <div class="lc-meta"><div><span>Role</span><strong>UX Designer</strong></div><div><span>Focus</span><strong>Research, Strategy, Conversation Design</strong></div><div><span>Year</span><strong>2024</strong></div></div>
          </section>
          <section class="lc-sec"><div class="lc-num">02 · Key insight</div><h2 class="lc-h">Information existed — discoverability was the problem.</h2>
            <p>Members often contacted concierge staff for answers already available within the app. Navigation, not content, was the primary obstacle. The work mapped intents, conversation flows, and edge cases so an AI concierge could become a single entry point into the ecosystem.</p>
          </section>
        </div>`
    }
  };

  const caseHub = document.getElementById('caseHubModal');
  const caseWriteup = document.getElementById('caseWriteup');
  bindClose(caseHub, document.getElementById('chClose'));
  document.getElementById('caseWriteupClose')?.addEventListener('click', () => caseWriteup.classList.remove('open'));
  caseWriteup?.addEventListener('click', e => { if (e.target === caseWriteup) caseWriteup.classList.remove('open'); });

  function showCaseMain(key) {
    const c = CASES[key];
    const main = document.getElementById('chMain');
    if (!c) {
      main.innerHTML = `<div class="ch-eyebrow">Folder · 3 case studies</div><h2>Select a case study.</h2><p>Three projects covering a self-built mobile web app, a new product launch, and AI product design. Choose one from the side tab to open the full write-up.</p>`;
      return;
    }
    main.innerHTML = `
      <div class="ch-eyebrow">${c.kicker}</div>
      ${c.hero ? `<div class="ch-hero"><img src="${c.hero}" alt=""></div>` : ''}
      <h2>${c.name}</h2>
      <p>${c.blurb}</p>
      <div class="cs-tags">${c.tags.map(t => `<span class="cs-tag">${t}</span>`).join('')}</div>
      <button type="button" class="ch-open" data-open-case="${key}">Open write-up →</button>`;
    main.querySelector('.ch-open')?.addEventListener('click', () => openCaseWriteup(key));
  }
  function openCaseWriteup(key) {
    const c = CASES[key];
    if (!c) return;
    document.getElementById('caseWriteupTitle').textContent = `${c.num} — ${c.name}`;
    document.getElementById('caseWriteupBody').innerHTML = c.html;
    caseWriteup.classList.add('open');
  }
  caseHub?.querySelectorAll('.ch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      caseHub.querySelectorAll('.ch-tab').forEach(t => t.classList.toggle('is-active', t === tab));
      showCaseMain(tab.dataset.case);
    });
  });
  function openCases() {
    caseHub.querySelectorAll('.ch-tab').forEach(t => t.classList.remove('is-active'));
    showCaseMain(null);
    openModal(caseHub);
  }

  /* ---------- Stickies ---------- */
  const stickiesModal = document.getElementById('stickiesModal');
  bindClose(stickiesModal, document.getElementById('stickiesClose'));
  const canvas = document.getElementById('stCanvas');
  const ctx = canvas?.getContext('2d');
  const COLORS = ['#1a1a1a', '#c33', '#e67e22', '#f1c40f', '#27ae60', '#2980b9', '#8e44ad', '#fff'];
  let brush = 'pen', drawing = false, last = null, paper = '#ffffff';
  const colorBox = document.getElementById('stColors');
  if (colorBox) {
    colorBox.innerHTML = COLORS.map((c, i) => `<button type="button" data-color="${c}" style="width:18px;height:18px;border-radius:50%;border:1px solid rgba(0,0,0,.2);background:${c};padding:0;cursor:pointer;${i === 0 ? 'outline:2px solid #1a1a1a' : ''}"></button>`).join('');
    let ink = '#1a1a1a';
    colorBox.addEventListener('click', e => {
      const b = e.target.closest('[data-color]');
      if (!b) return;
      ink = b.dataset.color;
      colorBox.querySelectorAll('button').forEach(x => { x.style.outline = x === b ? '2px solid #1a1a1a' : 'none'; });
    });
    const pos = e => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
    };
    const paint = (from, to) => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Number(document.getElementById('stSize').value) * (brush === 'marker' ? 3 : 1);
      ctx.strokeStyle = brush === 'eraser' ? paper : ink;
      ctx.globalCompositeOperation = brush === 'eraser' ? 'source-over' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };
    canvas.addEventListener('pointerdown', e => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); paint(last, p); last = p; });
    const stop = () => { drawing = false; };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    document.getElementById('stClear')?.addEventListener('click', () => { ctx.fillStyle = paper; ctx.fillRect(0, 0, canvas.width, canvas.height); });
    document.getElementById('stPaperBtn')?.addEventListener('click', () => {
      const next = paper === '#ffffff' ? '#fff6c8' : paper === '#fff6c8' ? '#ffd9e2' : paper === '#ffd9e2' ? '#d9f0ff' : '#ffffff';
      paper = next;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvas.style.background = paper;
    });
    stickiesModal.querySelectorAll('[data-brush]').forEach(btn => {
      btn.addEventListener('click', () => {
        brush = btn.dataset.brush;
        stickiesModal.querySelectorAll('[data-brush]').forEach(x => x.classList.toggle('active', x === btn));
        document.getElementById('stStickerPane').style.display = 'none';
        document.getElementById('stDrawPane').style.display = 'flex';
        document.getElementById('stWallPane').style.display = 'none';
      });
    });
    const emojis = Array.from('🌀✨🌸🌷🌈☁️⭐💫🌙☀️🌊🔥💐🌻🌿🍒🍓🍋🍊🥐☕🎧📸💌💖🦋🐚🐣🐰🐱🦄🎨🎀');
    const grid = document.getElementById('stStickerGrid');
    if (grid) {
      grid.innerHTML = emojis.map(e => `<button type="button">${e}</button>`).join('');
      grid.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        ctx.font = '64px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
        ctx.fillText(b.textContent, 80 + Math.random() * 800, 80 + Math.random() * 500);
      });
    }
    stickiesModal.querySelector('[data-tab="sticker"]')?.addEventListener('click', () => {
      document.getElementById('stDrawPane').style.display = 'none';
      document.getElementById('stWallPane').style.display = 'none';
      document.getElementById('stStickerPane').style.display = 'flex';
    });
    document.getElementById('stViewWallBtn')?.addEventListener('click', () => {
      const wall = document.getElementById('stWallPane');
      const draw = document.getElementById('stDrawPane');
      const showWall = wall.style.display === 'none' || !wall.style.display;
      wall.style.display = showWall ? 'flex' : 'none';
      draw.style.display = showWall ? 'none' : 'flex';
      document.getElementById('stStickerPane').style.display = 'none';
    });
    document.getElementById('stPost')?.addEventListener('click', () => {
      const wall = JSON.parse(localStorage.getItem('desk-stickies') || '[]');
      wall.unshift({ img: canvas.toDataURL('image/jpeg', 0.8), name: document.getElementById('stName').value, msg: document.getElementById('stMessage').value, t: Date.now() });
      localStorage.setItem('desk-stickies', JSON.stringify(wall.slice(0, 24)));
      document.getElementById('stPostStatus').textContent = 'Posted to your local wall.';
      const g = document.getElementById('stWallGrid');
      g.innerHTML = wall.map(s => `<div><img src="${s.img}" alt="" style="width:100%;display:block"></div>`).join('');
    });
    const existing = JSON.parse(localStorage.getItem('desk-stickies') || '[]');
    if (existing.length) document.getElementById('stWallGrid').innerHTML = existing.map(s => `<div><img src="${s.img}" alt="" style="width:100%;display:block"></div>`).join('');
  }
  function openStickies() { openModal(stickiesModal); }

  /* ---------- Chess ---------- */
  (function initChess() {
    const boardEl = document.getElementById('chBoard');
    if (!boardEl) return;
    const statusEl = document.getElementById('chStatus');
    const resetEl = document.getElementById('chReset');
    const GLYPH = { wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙', bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟' };
    const VAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };
    const CENTER = [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,2,2,2,2,1,0,0,1,2,3,3,2,1,0,0,1,2,3,3,2,1,0,0,1,2,2,2,2,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0];
    const START = ('bR bN bB bQ bK bB bN bR bP bP bP bP bP bP bP bP .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. wP wP wP wP wP wP wP wP wR wN wB wQ wK wB wN wR').split(/\s+/).map(v => v === '..' ? null : v);
    const N_OFF = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    const K_OFF = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    const B_DIR = [[-1,-1],[-1,1],[1,-1],[1,1]];
    const R_DIR = [[-1,0],[1,0],[0,-1],[0,1]];
    const rank = i => (i >> 3), file = i => (i & 7);
    const idx = (r, c) => r * 8 + c;
    const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    let board, sel, legal, over, busy, last;
    function pseudo(b, color) {
      const out = [];
      for (let i = 0; i < 64; i++) {
        const p = b[i]; if (!p || p[0] !== color) continue;
        const t = p[1], r = rank(i), c = file(i);
        if (t === 'P') {
          const d = color === 'w' ? -1 : 1, home = color === 'w' ? 6 : 1, r1 = r + d;
          if (inside(r1, c) && !b[idx(r1, c)]) {
            out.push({ from: i, to: idx(r1, c), promo: (r1 === 0 || r1 === 7) });
            const r2 = r + 2 * d;
            if (r === home && !b[idx(r2, c)]) out.push({ from: i, to: idx(r2, c) });
          }
          [-1, 1].forEach(dc => {
            const cc = c + dc; if (!inside(r1, cc)) return;
            const tgt = b[idx(r1, cc)];
            if (tgt && tgt[0] !== color) out.push({ from: i, to: idx(r1, cc), promo: (r1 === 0 || r1 === 7) });
          });
        } else if (t === 'N' || t === 'K') {
          (t === 'N' ? N_OFF : K_OFF).forEach(o => {
            const r1 = r + o[0], c1 = c + o[1]; if (!inside(r1, c1)) return;
            const tgt = b[idx(r1, c1)];
            if (!tgt || tgt[0] !== color) out.push({ from: i, to: idx(r1, c1) });
          });
        } else {
          (t === 'B' ? B_DIR : t === 'R' ? R_DIR : B_DIR.concat(R_DIR)).forEach(d => {
            let r1 = r + d[0], c1 = c + d[1];
            while (inside(r1, c1)) {
              const j = idx(r1, c1), tgt = b[j];
              if (!tgt) out.push({ from: i, to: j });
              else { if (tgt[0] !== color) out.push({ from: i, to: j }); break; }
              r1 += d[0]; c1 += d[1];
            }
          });
        }
      }
      return out;
    }
    function apply(b, m) { const nb = b.slice(); const p = nb[m.from]; nb[m.from] = null; nb[m.to] = m.promo ? p[0] + 'Q' : p; return nb; }
    function kingSq(b, color) { for (let i = 0; i < 64; i++) if (b[i] === color + 'K') return i; return -1; }
    function inCheck(b, color) { const k = kingSq(b, color); return k >= 0 && pseudo(b, color === 'w' ? 'b' : 'w').some(m => m.to === k); }
    function moves(b, color) { return pseudo(b, color).filter(m => !inCheck(apply(b, m), color)); }
    function evaluate(b) { let s = 0; for (let i = 0; i < 64; i++) { const p = b[i]; if (!p) continue; const v = VAL[p[1]] + CENTER[i] * (p[1] === 'P' ? 4 : 3); s += p[0] === 'b' ? v : -v; } return s; }
    function search(b, color, depth, alpha, beta) {
      if (depth === 0) return evaluate(b);
      const ms = moves(b, color); if (!ms.length) return inCheck(b, color) ? (color === 'b' ? -50000 : 50000) : 0;
      if (color === 'b') { let best = -Infinity; for (const m of ms) { best = Math.max(best, search(apply(b, m), 'w', depth - 1, alpha, beta)); alpha = Math.max(alpha, best); if (alpha >= beta) break; } return best; }
      let best = Infinity; for (const m of ms) { best = Math.min(best, search(apply(b, m), 'b', depth - 1, alpha, beta)); beta = Math.min(beta, best); if (alpha >= beta) break; } return best;
    }
    function bestMove(b) {
      const ms = moves(b, 'b'); let best = null, score = -Infinity;
      for (const m of ms) { const s = search(apply(b, m), 'w', 2, -Infinity, Infinity); if (s >= score) { score = s; best = m; } }
      return best;
    }
    const cells = [];
    for (let i = 0; i < 64; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ch-sq' + (((rank(i) + file(i)) % 2) ? ' dark' : '');
      btn.dataset.i = String(i);
      const glyph = document.createElement('span');
      btn.appendChild(glyph);
      cells.push({ btn, glyph });
      boardEl.appendChild(btn);
    }
    function setStatus(t) { if (statusEl) statusEl.textContent = t; }
    function render() {
      const wK = inCheck(board, 'w') ? kingSq(board, 'w') : -1, bK = inCheck(board, 'b') ? kingSq(board, 'b') : -1;
      for (let i = 0; i < 64; i++) {
        const { btn, glyph } = cells[i], p = board[i];
        glyph.textContent = p ? GLYPH[p] : '';
        btn.classList.toggle('sel', i === sel);
        btn.classList.toggle('last', !!last && (i === last.from || i === last.to) && i !== sel);
        btn.classList.toggle('chk', i === wK || i === bK);
        const isLegal = legal.some(m => m.to === i);
        btn.classList.toggle('mv', isLegal && !p);
        btn.classList.toggle('cap', isLegal && !!p);
      }
    }
    function endCheck(color) {
      const ms = moves(board, color);
      if (ms.length) { setStatus(color === 'w' ? (inCheck(board, 'w') ? 'you are in check' : 'your move') : 'thinking…'); return false; }
      over = true;
      setStatus(inCheck(board, color) ? (color === 'w' ? 'checkmate — you lose' : 'checkmate — you win') : 'stalemate — draw');
      return true;
    }
    function computerMove() {
      busy = true; setStatus('thinking…'); render();
      setTimeout(() => {
        const m = bestMove(board); busy = false;
        if (!m) { endCheck('b'); render(); return; }
        board = apply(board, m); last = m; render(); endCheck('w');
      }, 220);
    }
    boardEl.addEventListener('click', e => {
      const cell = e.target.closest('.ch-sq'); if (!cell || over || busy) return;
      const i = Number(cell.dataset.i);
      const move = legal.find(m => m.to === i);
      if (move) { board = apply(board, move); last = move; sel = null; legal = []; render(); if (!endCheck('b')) computerMove(); return; }
      if (board[i] && board[i][0] === 'w') { sel = sel === i ? null : i; legal = sel === null ? [] : moves(board, 'w').filter(m => m.from === i); }
      else { sel = null; legal = []; }
      render();
    });
    function reset() { board = START.slice(); sel = null; legal = []; over = false; busy = false; last = null; setStatus('your move'); render(); }
    resetEl?.addEventListener('click', reset);
    reset();
  })();
  const chessModal = document.getElementById('chessModal');
  bindClose(chessModal, document.getElementById('chessClose'));

  /* ---------- Synthesizer ---------- */
  (function initPK01() {
    const modal = document.getElementById('pk01Modal');
    const closeB = document.getElementById('pk01Close');
    const canvas = document.getElementById('pk01Canvas');
    const noteEl = document.getElementById('pk01Note');
    const clearB = document.getElementById('pk01Clear');
    if (!modal || !canvas) return;
    bindClose(modal, closeB);
    const ctx = canvas.getContext('2d');
    const state = { wave: 'sine', decay: 0.8, reverb: 0.3, size: 0.5, spread: 0.5, particles: [], audio: null, master: null, convolver: null, dry: null, wet: null };
    const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];
    const FREQ = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880 };
    let raf = 0;
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      state.particles.length = 0;
      if (state.audio && state.audio.state === 'running') state.audio.suspend();
    }
    function resize() { const r = canvas.getBoundingClientRect(); canvas.width = r.width * devicePixelRatio; canvas.height = r.height * devicePixelRatio; }
    function initAudio() {
      if (state.audio) return;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const ac = new AC();
      const master = ac.createGain(); master.gain.value = 0.3; master.connect(ac.destination);
      const dry = ac.createGain(); dry.gain.value = 1 - state.reverb; dry.connect(master);
      const wet = ac.createGain(); wet.gain.value = state.reverb; wet.connect(master);
      const conv = ac.createConvolver();
      const rate = ac.sampleRate, len = rate * 2, imp = ac.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) { const d = imp.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2); }
      conv.buffer = imp; conv.connect(wet);
      state.audio = ac; state.master = master; state.dry = dry; state.wet = wet; state.convolver = conv;
    }
    function playTone(freq) {
      if (!state.audio) initAudio(); const ac = state.audio; if (!ac) return;
      if (ac.state === 'suspended') ac.resume();
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.type = state.wave; osc.frequency.value = freq;
      const decay = 0.15 + state.decay * 2;
      g.gain.setValueAtTime(0.25, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + decay);
      osc.connect(g); g.connect(state.dry); g.connect(state.convolver);
      osc.start(); osc.stop(ac.currentTime + decay + 0.05);
    }
    function spawn(x, y) {
      const idx = Math.floor(Math.random() * NOTES.length);
      const note = NOTES[idx]; playTone(FREQ[note]); noteEl.textContent = note;
      const count = 80 + Math.floor(state.size * 160);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (0.2 + Math.random() * 1.0) * (0.5 + state.spread * 1.4);
        state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, r: 0.4 + Math.random() * 1.6 });
      }
    }
    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const next = [];
      for (const p of state.particles) {
        p.x += p.vx; p.y += p.vy; p.life -= 0.008;
        if (p.life <= 0) continue;
        ctx.fillStyle = `rgba(255,255,255,${p.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        next.push(p);
      }
      state.particles = next;
    }
    function local(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
    }
    canvas.addEventListener('pointerdown', e => { const p = local(e); spawn(p.x, p.y); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (e.buttons) { const p = local(e); spawn(p.x, p.y); } });
    document.querySelectorAll('#pk01Panel .pk01-wave').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#pk01Panel .pk01-wave').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected'); state.wave = btn.dataset.wave;
      });
    });
    document.querySelectorAll('.pk01-knob-group').forEach(g => {
      const key = g.dataset.key; const dot = g.querySelector('.pk01-knob-dot'); const val = g.querySelector('.pk01-knob-val');
      const set = v => { state[key] = v; val.textContent = v.toFixed(2); dot.style.transform = `translateX(-50%) rotate(${-135 + v * 270}deg)`; };
      set(state[key]);
      g.querySelector('.pk01-knob').addEventListener('wheel', e => { e.preventDefault(); set(Math.min(1, Math.max(0, state[key] + (e.deltaY > 0 ? -0.04 : 0.04)))); }, { passive: false });
    });
    clearB?.addEventListener('click', () => { state.particles.length = 0; noteEl.textContent = '--'; });
    closeB?.addEventListener('click', stop);
    modal.addEventListener('click', event => { if (event.target === modal) stop(); });
    window.__openSynth = () => {
      openModal(modal);
      requestAnimationFrame(() => { resize(); if (!raf) frame(); });
    };
    window.__closeSynth = stop;
    window.addEventListener('resize', () => { if (modal.classList.contains('open')) resize(); });
  })();

  window.__openApp = name => {
    const map = {
      about: () => openCollection('shelf'),
      photos: () => openCollection('photos'),
      archive: openResume,
      notebook: openNotebook,
      chess: () => openModal(chessModal),
      toolkit: () => window.__openSynth?.(),
      notes: openStickies,
      works: openCases
    };
    map[name]?.();
  };
})();

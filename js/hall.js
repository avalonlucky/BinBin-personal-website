(() => {
  const root = document.querySelector(".cs-hall");
  if (!root) return;

  const ART_ASPECT = 2611 / 3378;
  const EASE = "power3.inOut";
  const wall = root.querySelector(".hall-wall");
  const sheets = [...root.querySelectorAll(".hall-sheet")];
  const slots = [...root.querySelectorAll(".hall-slot")];
  let selected = null;
  let busy = false;
  let focusEl = null;
  let hintEl = null;

  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loadHi = (src, onReady) => {
    const img = new Image();
    img.onload = () => onReady(src);
    img.src = src;
    if (img.complete) onReady(src);
  };

  const clearFocus = () => {
    if (focusEl) {
      if (window.gsap) gsap.killTweensOf(focusEl);
      focusEl.remove();
      focusEl = null;
    }
    hintEl?.remove();
    hintEl = null;
    slots.forEach((slot) => slot.classList.remove("is-empty"));
    root.querySelectorAll(".hall-empty").forEach((el) => el.remove());
    sheets.forEach((sheet) => {
      sheet.classList.remove("is-away");
      sheet.tabIndex = 0;
    });
    root.classList.remove("is-focused");
    selected = null;
    busy = false;
  };

  const placeFocus = (index, animate) => {
    const sheet = sheets[index];
    if (!sheet || !wall || !focusEl) return;
    const wallBox = wall.getBoundingClientRect();
    const from = sheet.getBoundingClientRect();
    let height = Math.min(window.innerHeight * 0.62, 560);
    let width = height * ART_ASPECT;
    const maxW = Math.min(window.innerWidth * 0.36, wallBox.width * 0.42);
    if (width > maxW) {
      width = maxW;
      height = width / ART_ASPECT;
    }
    focusEl.style.left = `${wallBox.width / 2 - width / 2}px`;
    focusEl.style.top = `${Math.max(20, wallBox.height * 0.48 - height / 2)}px`;
    focusEl.style.width = `${width}px`;
    focusEl.style.height = `${height}px`;

    if (!window.gsap || !animate || reduced()) {
      busy = false;
      return;
    }

    const to = focusEl.getBoundingClientRect();
    gsap.fromTo(
      focusEl,
      {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: from.height / to.height,
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: EASE,
        onComplete: () => {
          busy = false;
        },
      },
    );
  };

  const returnWork = () => {
    if (selected === null) return;
    const sheet = sheets[selected];
    if (!focusEl || !sheet || !window.gsap || reduced()) {
      clearFocus();
      return;
    }
    busy = true;
    const from = focusEl.getBoundingClientRect();
    const dest = sheet.getBoundingClientRect();
    gsap.to(focusEl, {
      x: dest.left + dest.width / 2 - (from.left + from.width / 2),
      y: dest.top + dest.height / 2 - (from.top + from.height / 2),
      scale: dest.height / from.height,
      duration: 0.5,
      ease: EASE,
      onComplete: clearFocus,
    });
  };

  const selectWork = (index) => {
    if (busy) return;
    if (selected === index) {
      returnWork();
      return;
    }
    if (selected !== null) return;
    busy = true;
    selected = index;
    const work = sheets[index];
    const slot = slots[index];
    const src = work.dataset.src;
    const title = work.dataset.title;

    root.classList.add("is-focused");
    slot.classList.add("is-empty");
    work.classList.add("is-away");
    work.tabIndex = -1;

    const empty = document.createElement("button");
    empty.type = "button";
    empty.className = "hall-empty";
    empty.setAttribute("aria-label", `将${title}放回展位`);
    empty.innerHTML = "<i>+</i>";
    empty.addEventListener("click", returnWork);
    slot.querySelector(".hall-acrylic").append(empty);

    focusEl = document.createElement("button");
    focusEl.type = "button";
    focusEl.className = "hall-focus";
    focusEl.setAttribute("aria-label", `归档${title}`);
    focusEl.innerHTML = `<img src="${work.querySelector("img").src}" alt="${title}" width="1400" height="1811" draggable="false">`;
    focusEl.addEventListener("click", returnWork);
    wall.append(focusEl);

    hintEl = document.createElement("p");
    hintEl.className = "hall-hint";
    hintEl.innerHTML = "<i></i>点击查看 · 再次点击归档";
    wall.append(hintEl);

    loadHi(src, (hi) => {
      if (selected !== index || !focusEl) return;
      focusEl.querySelector("img").src = hi;
    });

    requestAnimationFrame(() => placeFocus(index, true));
  };

  sheets.forEach((sheet, index) => {
    sheet.addEventListener("click", () => selectWork(index));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") returnWork();
  });

  window.addEventListener("resize", () => {
    if (selected === null) return;
    placeFocus(selected, false);
  });
})();

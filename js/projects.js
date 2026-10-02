(() => {
  const gallery = document.querySelector(".projects-gallery");
  if (!gallery || !portfolioProjects.length) return;

  const stage = gallery.querySelector(".projects-stage");
  const mainList = gallery.querySelector(".project-list");
  const previewList = gallery.querySelector(".minimap-img-preview");
  const infoList = gallery.querySelector(".minimap-info-list");
  const menuButton = document.querySelector(".menu-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const entries = new Map();

  let current = 0;
  let target = 0;
  let frame = null;
  let snapTimer;
  let lastTime = 0;
  let touchY = null;

  function menuIsOpen() {
    return menuButton?.getAttribute("aria-expanded") === "true";
  }

  function getProject(index) {
    const count = portfolioProjects.length;
    return portfolioProjects[((index % count) + count) % count];
  }

  function makeImage(project, decorative = false) {
    const image = document.createElement("img");
    image.src = project.image;
    image.alt = decorative ? "" : project.imageAlt;
    image.draggable = false;
    return image;
  }

  function createEntry(index) {
    const project = getProject(index);

    const main = document.createElement("div");
    main.className = "project";
    const mainImage = makeImage(project);
    main.append(mainImage);
    mainList.append(main);

    const preview = document.createElement("div");
    preview.className = "minimap-img-item";
    preview.setAttribute("aria-hidden", "true");
    const previewImage = makeImage(project, true);
    previewImage.className = "project-web-preview";
    preview.append(previewImage);

    if (project.mobileImage) {
      preview.classList.add("has-mobile-preview");

      const mobileImage = document.createElement("img");
      mobileImage.src = project.mobileImage;
      mobileImage.alt = "";
      mobileImage.className = "project-mobile-preview";
      mobileImage.draggable = false;

      preview.append(mobileImage);
    }

    previewList.append(preview);

    const info = document.createElement("article");
    info.className = "minimap-item-info";

    const category = document.createElement("p");
    category.className = "project-category";
    category.textContent = project.category;

    const title = document.createElement("h2");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = project.description;

    const technologies = document.createElement("ul");
    technologies.className = "project-technologies";

    project.technologies.forEach((technology) => {
      const item = document.createElement("li");
      item.textContent = technology;
      technologies.append(item);
    });

    info.append(category, title, description, technologies);
    infoList.append(info);

    entries.set(index, {
      main,
      mainImage,
      preview,
      previewImage,
      info,
    });
  }

  function render() {
    const center = Math.round(current);

    for (let index = center - 2; index <= center + 2; index++) {
      if (!entries.has(index)) createEntry(index);
    }

    entries.forEach((entry, index) => {
      if (Math.abs(index - center) > 2) {
        entry.main.remove();
        entry.preview.remove();
        entry.info.remove();
        entries.delete(index);
        return;
      }

      const offset = index - current;
      const mainHeight = stage.clientHeight;
      const previewHeight = previewList.clientHeight;

      entry.main.style.transform = `translateY(${offset * mainHeight}px)`;

      entry.preview.style.transform = `translateY(${offset * previewHeight}px)`;

      entry.info.style.transform = `translateY(${offset * infoList.clientHeight}px)`;

      const parallax = reduceMotion.matches ? 0 : -offset * 0.15;
      const scale = reduceMotion.matches ? 1 : 1.3;

      entry.mainImage.style.transform = `translateY(${parallax * mainHeight}px) scale(${scale})`;

      entry.previewImage.style.transform = "none";

      const inactive = index !== center;
      entry.main.setAttribute("aria-hidden", String(inactive));
      entry.info.setAttribute("aria-hidden", String(inactive));
      entry.info.inert = inactive;
    });
  }

  function animate(time) {
    const elapsed = Math.min(64, time - lastTime || 16);
    lastTime = time;

    const smoothing = 1 - Math.pow(0.9, elapsed / 16.67);
    current += (target - current) * smoothing;

    if (Math.abs(target - current) < 0.001) {
      current = target;
    }

    render();

    if (current !== target) {
      frame = requestAnimationFrame(animate);
    } else {
      frame = null;
    }
  }

  function startAnimation() {
    if (frame !== null) return;
    lastTime = 0;
    frame = requestAnimationFrame(animate);
  }

  function moveBy(amount) {
    if (menuIsOpen()) return;

    clearTimeout(snapTimer);

    if (reduceMotion.matches) {
      target += Math.sign(amount);
      current = target;
      render();
      return;
    }

    target += amount;
    startAnimation();

    snapTimer = setTimeout(() => {
      target = Math.round(target);
      startAnimation();
    }, 180);
  }

  gallery.addEventListener(
    "wheel",
    (event) => {
      if (menuIsOpen() || event.ctrlKey) return;

      const panel = event.target.closest(".minimap");
      if (panel && panel.scrollHeight > panel.clientHeight + 1) {
        const canScroll =
          event.deltaY > 0
            ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1
            : panel.scrollTop > 0;

        if (canScroll) return;
      }

      event.preventDefault();

      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? stage.clientHeight
            : 1;

      const delta = Math.max(-150, Math.min(150, event.deltaY * unit));

      moveBy((delta * 0.75) / stage.clientHeight);
    },
    { passive: false },
  );

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (menuIsOpen() || event.touches.length !== 1) return;

      const panel = event.target.closest(".minimap");
      if (panel && panel.scrollHeight > panel.clientHeight + 1) return;

      touchY = event.touches[0].clientY;
    },
    { passive: true },
  );

  stage.addEventListener(
    "touchmove",
    (event) => {
      if (touchY === null || menuIsOpen()) return;

      event.preventDefault();
      const nextY = event.touches[0].clientY;
      moveBy(((touchY - nextY) * 1.5) / stage.clientHeight);
      touchY = nextY;
    },
    { passive: false },
  );

  function endTouch() {
    touchY = null;
  }

  stage.addEventListener("touchend", endTouch);
  stage.addEventListener("touchcancel", endTouch);

  document.addEventListener("keydown", (event) => {
    if (menuIsOpen()) return;

    if (
      event.target.closest(
        "input, textarea, select, button, a, summary, [contenteditable]",
      )
    ) {
      return;
    }

    const forward = ["ArrowDown", "PageDown"].includes(event.key);
    const backward = ["ArrowUp", "PageUp"].includes(event.key);
    if (!forward && !backward) return;

    event.preventDefault();
    clearTimeout(snapTimer);
    target = Math.round(target) + (forward ? 1 : -1);

    if (reduceMotion.matches) {
      current = target;
      render();
    } else {
      startAnimation();
    }
  });

  new MutationObserver(() => {
    if (!menuIsOpen()) return;

    clearTimeout(snapTimer);
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    target = current = Math.round(current);
    touchY = null;
    render();
  }).observe(menuButton, {
    attributes: true,
    attributeFilter: ["aria-expanded"],
  });

  new ResizeObserver(render).observe(stage);

  reduceMotion.addEventListener("change", () => {
    clearTimeout(snapTimer);
    target = Math.round(target);
    startAnimation();
  });

  render();
})();

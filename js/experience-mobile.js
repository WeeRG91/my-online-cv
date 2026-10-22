(() => {
  const cards = [...document.querySelectorAll('.technology-card')];
  if (!cards.length || !window.gsap) return;

  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let cleanup;

  function activate() {
    const dialog = document.createElement('dialog');
    dialog.className = 'technology-detail-dialog';
    dialog.setAttribute('aria-labelledby', 'technology-detail-title');
    document.body.append(dialog);

    let source = null;
    let panel = null;
    let animation;
    let closing = false;
    let summary;
    let shade;
    let savedY = 0;
    let savedOverflow = '';
    let savedVisibility = '';

    const attributes = ['role', 'tabindex', 'aria-haspopup', 'aria-expanded', 'aria-label'];
    const originals = cards.map(card => attributes.map(name => card.getAttribute(name)));

    function syncAvailability() {
      cards.forEach(card => {
        const content = card.querySelector('.technology-card-content');
        const visible = Number(getComputedStyle(card).opacity) > 0.95 &&
          (!content || Number(getComputedStyle(content).opacity) > 0.95) &&
          getComputedStyle(card).visibility !== 'hidden';
        card.tabIndex = visible && !dialog.open ? 0 : -1;
      });
    }

    function finishClose() {
      if (!source) return;
      animation?.kill();
      const original = source;
      original.style.visibility = savedVisibility;
      original.setAttribute('aria-expanded', 'false');
      root.style.overflow = savedOverflow;
      dialog.close();
      dialog.replaceChildren();
      source = panel = summary = shade = null;
      closing = false;
      window.scrollTo({ top: savedY, behavior: 'instant' });
      syncAvailability();
      original.focus({ preventScroll: true });
    }

    function closeCard() {
      if (!source || closing) return;
      closing = true;
      animation?.kill();
      const bounds = source.getBoundingClientRect();
      panel.querySelector('.technology-card-content').scrollTop = 0;
      const duration = reduced.matches ? 0 : 0.7;
      animation = gsap.timeline({ onComplete: finishClose })
        .to([panel.querySelector('.technology-card-content'),
          panel.querySelector('.technology-detail-close')],
          { opacity: 0, duration: reduced.matches ? 0 : 0.18 }, 0)
        .to(panel, {
          left: bounds.left, top: bounds.top,
          width: bounds.width, height: bounds.height,
          duration, ease: 'sine.inOut',
        }, 0)
        .to(summary, { opacity: 1, duration: reduced.matches ? 0 : 0.25 },
          reduced.matches ? 0 : 0.3)
        .to(shade, { opacity: 0, duration }, 0);

    }

    function openCard(card) {
      if (source || card.tabIndex !== 0) return;
      source = card;
      savedY = window.scrollY;
      savedOverflow = root.style.overflow;
      savedVisibility = card.style.visibility;
      const bounds = card.getBoundingClientRect();
      const content = card.querySelector('.technology-card-content').cloneNode(true);
      content.querySelector('.technology-card-hint')?.remove();
      content.querySelector('h2').id = 'technology-detail-title';

      summary = card.querySelector('.technology-card-content').cloneNode(true);
      summary.className = 'technology-card-summary';
      summary.setAttribute('aria-hidden', 'true');
      summary.querySelectorAll('.toolkit-group').forEach(group => group.remove());
      shade = document.createElement('div');
      shade.className = 'technology-detail-shade';
      shade.setAttribute('aria-hidden', 'true');
      shade.addEventListener('click', closeCard);

      panel = document.createElement('article');
      panel.className = 'technology-card technology-expanded-card';
      panel.append(content, summary);

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'technology-detail-close';
      close.textContent = '×';
      const lang = root.lang;
      close.setAttribute('aria-label', lang === 'fr' ? 'Fermer la carte' :
        lang === 'th' ? 'ปิดการ์ด' : 'Close card');
      close.addEventListener('click', closeCard);
      panel.append(close);
      dialog.replaceChildren(shade, panel);

      root.style.overflow = 'hidden';
      dialog.showModal();
      card.style.visibility = 'hidden';
      card.setAttribute('aria-expanded', 'true');

      gsap.set(panel, {
        left: bounds.left, top: bounds.top,
        width: bounds.width, height: bounds.height,
      });
      const width = Math.min(640, window.innerWidth - 32);
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const available = Math.max(120, viewportHeight - 32);

      // Keep text at its final width, so it does not rewrap during the morph.
      panel.style.width = `${width}px`;
      panel.style.height = 'auto';
      const height = Math.min(content.scrollHeight + 2, available);
      panel.style.setProperty('--expanded-content-width', `${width - 2}px`);
      panel.style.setProperty('--expanded-content-height', `${height - 2}px`);
      gsap.set([content, close, shade], { opacity: 0 });
      gsap.set(panel, { width: bounds.width, height: bounds.height });
      animation = gsap.timeline()
        .to(shade, { opacity: 1, duration: reduced.matches ? 0 : 0.5 }, 0)
        .to(panel, {
          left: (window.innerWidth - width) / 2,
          top: Math.max(16, (viewportHeight - height) / 2),
          width, height,
          duration: reduced.matches ? 0 : 0.8,
          ease: 'sine.inOut',
        }, 0)
        .to(summary, { opacity: 0, duration: reduced.matches ? 0 : 0.2 }, 0)
        .to([content, close], { opacity: 1, duration: reduced.matches ? 0 : 0.3 },
          reduced.matches ? 0 : 0.45);
      close.focus({ preventScroll: true });
      syncAvailability();
    }

    const hints = cards.map(card => {
      const hint = document.createElement('span');
      hint.className = 'technology-card-hint';
      card.querySelector('.technology-card-content').append(hint);
      return hint;
    });

    function updateHints() {
      const lang = root.lang;
      const message = lang === 'fr' ? 'Touchez pour découvrir' :
        lang === 'th' ? 'แตะเพื่อดูรายละเอียด' : 'Tap to explore';
      hints.forEach((hint, index) => {
        hint.textContent = message;
        cards[index].setAttribute('aria-label',
          `${cards[index].querySelector('h2').textContent.trim()} - ${message}`);
      });
    }
    document.addEventListener('cv:languagechange', updateHints);
    updateHints();

    const handlers = cards.map(card => {
      card.classList.add('technology-card--expandable');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-label', `${card.querySelector('h2').textContent.trim()} - ${hints[cards.indexOf(card)].textContent}`);
      const click = () => openCard(card);
      const key = event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openCard(card);
      };
      card.addEventListener('click', click);
      card.addEventListener('keydown', key);
      return { click, key };
    });

    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeCard();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('.toolkit-card-heading')) {
        closeCard();
      }
    });

    // The original GSAP timeline stays in control of the original cards.
    const observer = new MutationObserver(syncAvailability);
    cards.forEach(card => observer.observe(card, {
      attributes: true, attributeFilter: ['style'], subtree: true,
    }));
    function handleResize() {
      if (source) finishClose();
      syncAvailability();
    }
    window.addEventListener('resize', handleResize);
    reduced.addEventListener('change', handleResize);
    syncAvailability();

    return () => {
      if (source) finishClose();
      observer.disconnect();
      document.removeEventListener('cv:languagechange', updateHints);
      hints.forEach(hint => hint.remove());
      window.removeEventListener('resize', handleResize);
      reduced.removeEventListener('change', handleResize);
      cards.forEach((card, index) => {
        card.removeEventListener('click', handlers[index].click);
        card.removeEventListener('keydown', handlers[index].key);
        card.classList.remove('technology-card--expandable');
        attributes.forEach((name, a) => {
          const value = originals[index][a];
          if (value === null) card.removeAttribute(name);
          else card.setAttribute(name, value);
        });
      });
      dialog.remove();
    };
  }

  function updateMode() {
    cleanup?.();
    cleanup = mobile.matches ? activate() : null;
  }
  mobile.addEventListener('change', updateMode);
  updateMode();
})();

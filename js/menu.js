(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const menu = document.querySelector("#site-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const pageContent = document.querySelector(".website-content");

  let menuIsOpen = false;
  let previousOverflow = "";

  function finishMenuClose() {
    menu.hidden = true;
    pageContent.inert = false;
    document.body.style.overflow = previousOverflow;
  }

  let menuTimeline = null;

  if (window.gsap && !reduceMotion) {
    menuTimeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (menuIsOpen) {
          menu.querySelector("a").focus();
        }
      },
      onReverseComplete: finishMenuClose,
    });

    menuTimeline
      .fromTo(
        pageContent,
        {
          clipPath: "inset(0%)",
          scale: 1,
        },
        {
          clipPath: "inset(50%)",
          scale: 0.85,
          duration: 0.8,
          ease: "power4.inOut",
        },
      )
      .fromTo(
        menu.querySelectorAll(".menu-row"),
        {
          xPercent: (index) => (index % 2 === 0 ? -110 : 110),
          opacity: 0,
        },
        {
          xPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power4.out",
        },
        0.2,
      );
  }

  function setMenuOpen(open) {
    if (open === menuIsOpen) return;

    document.querySelectorAll(".settings-dropdown").forEach((dropdown) => {
      dropdown.open = false;
    });

    menuIsOpen = open;

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      window.cvI18n.translate(open ? "menu.close" : "menu.open"),
    );

    if (open) {
      if (menu.hidden) {
        previousOverflow = document.body.style.overflow;
      }

      menu.hidden = false;
      menu.inert = false;
      pageContent.inert = true;
      document.body.style.overflow = "hidden";

      if (menuTimeline) {
        menuTimeline.play();
      } else {
        pageContent.style.visibility = "hidden";
        menu.querySelector("a").focus();
      }
    } else {
      menuToggle.focus();
      menu.inert = true;

      if (menuTimeline && menuTimeline.progress() > 0) {
        menuTimeline.reverse();
      } else {
        pageContent.style.visibility = "";
        finishMenuClose();
      }
    }
  }

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!menuIsOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (!menuIsOpen) return;

    if (event.key === "Escape") {
      setMenuOpen(false);
      return;
    }

    if (event.key === "Tab") {
      const dropdowns = document.querySelectorAll(".settings-dropdown");

      const settingsControls = [...dropdowns].flatMap((dropdown) => {
        const controls = [dropdown.querySelector("summary")];

        if (dropdown.open) {
          controls.push(dropdown.querySelector("input:checked"));
        }

        return controls;
      });

      const controls = [
        ...menu.querySelectorAll("a"),
        ...settingsControls,
        menuToggle,
      ];

      const currentIndex = controls.indexOf(document.activeElement);

      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + controls.length) % controls.length
        : (currentIndex + 1) % controls.length;

      event.preventDefault();
      controls[nextIndex].focus();
    }
  });
})();

(() => {
  const scene = document.querySelector(".contact-scene");
  if (!scene || !window.gsap) return;

  const button = scene.querySelector("button.contact-bubble");
  const envelope = button.querySelector(".contact-envelope");
  const flap = envelope.querySelector(".envelope-flap");
  const letter = envelope.querySelector(".envelope-letter");
  const panel = scene.querySelector(".contact-panel");
  const heading = panel.querySelector("h2");
  const introduction = panel.querySelector("p");
  const links = [...panel.querySelectorAll(".contact-link")];

  if (!flap || !letter) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  if (reduceMotion.matches) return;

  const surface = document.createElement("div");
  surface.className = "contact-surface";
  surface.setAttribute("aria-hidden", "true");
  scene.prepend(surface);

  scene.classList.add("contact-enhanced");

  button.hidden = false;
  button.setAttribute("aria-expanded", "false");
  panel.inert = true;
  heading.tabIndex = -1;

  gsap.set(panel, { autoAlpha: 0 });
  gsap.set(letter, { opacity: 0, y: 10 });
  gsap.set(envelope, { y: -12 });

  gsap.set(surface, {
    xPercent: -50,
    yPercent: -50,
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    autoAlpha: 1,
  });

  const floating = gsap.to([button, surface], {
    y: -8,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  let opened = false;
  let opening;

  function finishOpening() {
    button.setAttribute("aria-expanded", "true");
    button.hidden = true;
    panel.inert = false;

    gsap.set(surface, {
      width: "100%",
      height: "100%",
      borderRadius: 28,
      y: 0,
      autoAlpha: 1,
    });

    gsap.set(panel, { autoAlpha: 1 });

    gsap.set([heading, introduction, ...links], {
      clearProps: "transform,opacity,visibility",
    });

    heading.focus({ preventScroll: true });
  }

  button.addEventListener("click", () => {
    if (opened) return;
    opened = true;

    floating.kill();
    button.style.pointerEvents = "none";

    const size = panel.getBoundingClientRect();

    opening = gsap.timeline({
      onComplete: finishOpening,
    });

    opening
      .to([button, surface], {
        y: 0,
        duration: 0.2,
        ease: "sine.out",
      })

      .to(flap, {
        attr: { d: "M12 24 L50 -8 L88 24 Z" },
        duration: 0.4,
        ease: "power2.inOut",
      })

      .call(() => {
        envelope.insertBefore(flap, letter);
      })

      .to(letter, {
        opacity: 1,
        y: -26,
        duration: 0.35,
        ease: "power2.out",
      })

      .to(surface, {
        width: size.width,
        height: size.height,
        borderRadius: 28,
        duration: 0.85,
        ease: "sine.inOut",
      })

      .to(envelope, {
        opacity: 0,
        duration: 0.3,
        ease: "sine.in",
      }, "<")

      .set(button, { autoAlpha: 0 })
      .set(panel, { autoAlpha: 1 })

      .fromTo(
        [heading, introduction, ...links],
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        },
      );
  });

  reduceMotion.addEventListener("change", (event) => {
    if (!event.matches) return;

    opened = true;
    floating.kill();
    opening?.kill();
    finishOpening();
  });
})();
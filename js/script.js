const preloader = document.querySelector(".preloader");
const splitOverlay = document.querySelector(".split-overlay");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (window.gsap && window.SplitText && !reduceMotion) {
  gsap.registerPlugin(SplitText);

  const titleSplit = SplitText.create(".intro-title p", {
    type: "words,chars",
    charsClass: "intro-char",
  });

  const letterFaces = titleSplit.chars.map((char) => {
    const face = document.createElement("span");

    face.className = "letter-face";
    face.textContent = char.textContent;

    char.replaceChildren(face);

    return face;
  });

  const firstChar = titleSplit.words[0].querySelector(".intro-char");
  const secondChar = titleSplit.words[1].querySelector(".intro-char");

  const initials = [firstChar, secondChar];

  const otherChars = titleSplit.chars.filter(
    (char) => !initials.includes(char),
  );
  const otherFaces = otherChars.map((char) =>
    char.querySelector(".letter-face"),
  );

  gsap.set(preloader, { visibility: "visible" });

  const tear = { progress: 0 };
  const timeline = gsap.timeline();

  timeline
    .fromTo(
      letterFaces,
      {
        yPercent: -100,
        opacity: 0,
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.06,
        ease: "power2.out",
      },
    )
    .to(
      otherFaces,
      {
        yPercent: 100,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.in",
      },
      "+=0.5",
    )
    .to(initials, {
      x: (index, element) => {
        const firstBounds = firstChar.getBoundingClientRect();
        const secondBounds = secondChar.getBoundingClientRect();
        const bounds = element.getBoundingClientRect();

        const gap = 8;
        const pairWidth = firstBounds.width + gap + secondBounds.width;
        const pairLeft = (window.innerWidth - pairWidth) / 2;

        const targetLeft =
          index === 0 ? pairLeft : pairLeft + firstBounds.width + gap;

        return targetLeft - bounds.left;
      },
      y: (index, element) => {
        const bounds = element.getBoundingClientRect();

        return window.innerHeight / 2 - (bounds.top + bounds.height / 2);
      },
      duration: 0.8,
      ease: "power2.inOut",
    })
    .to(initials, {
      scale: (index) => (index === 0 ? 1.6 : 0.6),
      transformOrigin: (index) =>
        index === 0 ? "right center" : "left center",
      duration: 0.8,
      ease: "power2.inOut",
    })
    .call(
      () => {
        const titleCopy = preloader
          .querySelector(".intro-title")
          .cloneNode(true);

        splitOverlay.replaceChildren(titleCopy);

        gsap.set(splitOverlay, {
          visibility: "visible",
          clipPath: "none",
        });
      },
      null,
      "+=0.2",
    )
    .addLabel("tearStart")
    .to(tear, {
      progress: 100,
      duration: 0.8,
      ease: "none",
      onUpdate: () => {
        const pixelRatio = window.devicePixelRatio || 1;

        const snap = (value) => Math.round(value * pixelRatio) / pixelRatio;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const cutX = snap((width * tear.progress) / 100);
        const topEdge = snap(height / 2 - 30);
        const bottomEdge = snap(height / 2 + 30);

        preloader.style.clipPath = `polygon(
            0px 0px,
            ${width}px 0px,
            ${width}px ${height}px,
            ${cutX}px ${height}px,
            ${cutX}px ${topEdge}px,
            0px ${topEdge}px
        )`;

        splitOverlay.style.clipPath = `polygon(
            0px ${bottomEdge}px,
            ${cutX}px ${bottomEdge}px,
            ${cutX}px 0px,
            ${width}px 0px,
            ${width}px ${height}px,
            0px ${height}px
        )`;
      },
    })
    .to([preloader, splitOverlay], {
      yPercent: (index) => (index === 0 ? -50 : 50),
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set([preloader, splitOverlay], {
          display: "none",
        });
      },
    });

  if (window.ScrambleTextPlugin) {
    gsap.registerPlugin(ScrambleTextPlugin);

    const heroName = document.querySelector(".hero-name");
    const fullName = heroName.textContent.trim();

    gsap.set(heroName, { visibility: "hidden" });

    timeline.to(
      heroName,
      {
        duration: 3,
        onStart: () => {
          gsap.set(heroName, { visibility: "visible" });
        },
        scrambleText: {
          text: fullName,
          chars: "upperAndLowerCase",
          revealDelay: 0.5,
          speed: 0.5,
        },
        ease: "none",
      },
      "tearStart+=0.8",
    );
  }
}
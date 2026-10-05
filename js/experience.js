(() => {
  const toolkit = document.querySelector(".experience-toolkit");
  if (!toolkit || !window.gsap) return;

  const scene = toolkit.querySelector(".technology-scene");
  const title = scene.querySelector("#toolkit-title");
  const labels = [...scene.querySelectorAll(".technology-label")];
  const circle = scene.querySelector(".technology-circle");
  const cards = toolkit.querySelector(".technology-cards");
  const items = [...cards.querySelectorAll(".technology-card")];
  const menuButton = document.querySelector(".menu-toggle");

  const positions = [
    [12, 16], // C#
    [35, 12], // PHP
    [60, 16], // JavaScript
    [84, 20], // TypeScript
    [16, 32], // Laravel
    [78, 34], // ASP.NET Core
    [10, 50], // Vue
    [88, 52], // React
    [18, 68], // React Native
    [42, 78], // SQL
    [70, 70], // Inertia
    [87, 84], // GSAP
    [15, 87], // HTML
    [38, 91], // CSS
    [62, 88], // Tailwind CSS
    [45, 28], // Redux
    [56, 65], // Pinia
  ];

  labels.forEach((label, index) => {
    const [x, y] = positions[index % positions.length];
    label.style.left = `${x}%`;
    label.style.top = `${y}%`;
  });

  const contents = items.map((card) => {
    const content = document.createElement("div");
    content.className = "technology-card-content";

    while (card.firstChild) {
      content.append(card.firstChild);
    }

    card.append(content);
    return content;
  });

  const media = gsap.matchMedia();

  media.add("(prefers-reduced-motion: no-preference)", () => {
    const track = document.createElement("div");
    track.className = "technology-scroll-track";

    scene.before(track);
    track.append(scene);
    scene.append(cards);
    scene.classList.add("is-animated");

    let timeline;
    let frame;

    labels.forEach((label, index) => {
      gsap.fromTo(
        label,
        { translate: "0 -5px" },
        {
          translate: "0 5px",
          duration: 2 + index * 0.08,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        },
      );
    });

    function update() {
      frame = null;

      if (menuButton?.getAttribute("aria-expanded") === "true") {
        return;
      }

      const travel = track.offsetHeight - scene.clientHeight;
      const progress = Math.max(
        0,
        Math.min(1, -track.getBoundingClientRect().top / Math.max(1, travel)),
      );

      timeline.progress(progress);
    }

    function scheduleUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    function buildTimeline() {
      timeline?.kill();

      const width = scene.clientWidth;
      const height = scene.clientHeight;
      const mobile = width <= 700;
      const gap = mobile ? 16 : 28;
      const availableHeight = Math.max(160, height - 110);

      const cardWidth = mobile
        ? width - 32
        : Math.min(580, (width - 80 - gap) / 2);

      const cardHeight = mobile
        ? (availableHeight - gap) / 2
        : Math.min(580, availableHeight);

      const centerY = 80 + availableHeight / 2;

      const destinations = items.map((_, index) => ({
        x: mobile
          ? width / 2
          : width / 2 + ((index === 0 ? -1 : 1) * (cardWidth + gap)) / 2,
        y: mobile
          ? centerY + ((index === 0 ? -1 : 1) * (cardHeight + gap)) / 2
          : centerY,
      }));

      labels.forEach((label, index) => {
        const [x, y] = positions[index % positions.length];

        gsap.set(label, {
          left: `${x}%`,
          top: `${y}%`,
          opacity: 1,
          scale: 1,
        });
      });

      gsap.set(title, { opacity: 1 });
      gsap.set(circle, { opacity: 0 });
      gsap.set(cards, { visibility: "visible" });
      gsap.set(contents, { opacity: 0 });

      gsap.set(items, {
        left: width / 2,
        top: height / 2,
        xPercent: -50,
        yPercent: -50,
        width: 64,
        height: 64,
        borderRadius: 32,
        opacity: 0,
      });

      timeline = gsap.timeline({ paused: true });

      timeline
        .to(title, { opacity: 0, duration: 0.3 })
        .to(labels, {
          left: "50%",
          top: "50%",
          duration: 1,
          ease: "power2.inOut",
        })
        .to(labels, {
          opacity: 0,
          scale: 0.2,
          duration: 0.25,
        })
        .to(
          circle,
          {
            opacity: 1,
            duration: 0.25,
          },
          "<",
        )
        .to({}, { duration: 0.25 })
        .set(items, { opacity: 1 })
        .set(circle, { opacity: 0 })
        .to(items, {
          left: (index) => destinations[index].x,
          top: (index) => destinations[index].y,
          duration: 0.7,
          ease: "power2.inOut",
        })
        .to({}, { duration: 0.2 })
        .to(items, {
          width: cardWidth,
          height: cardHeight,
          borderRadius: 24,
          duration: 0.8,
          ease: "power2.inOut",
        })
        .to(contents, {
          opacity: 1,
          duration: 0.35,
        })
        .to({}, { duration: 0.8 });

      update();
    }

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    const observer = new ResizeObserver(buildTimeline);
    observer.observe(scene);

    buildTimeline();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      cancelAnimationFrame(frame);
      timeline?.kill();

      scene.classList.remove("is-animated");
      track.before(scene);
      scene.after(cards);
      track.remove();
    };
  });
})();

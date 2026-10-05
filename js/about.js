(() => {
  const layout = document.querySelector(".journey-layout");
  const svg = layout.querySelector(".flight-route");
  const path = svg.querySelector("#flight-path");
  const traveler = layout.querySelector(".flight-traveler");
  const travelerImage = traveler.querySelector("img");

  const reveal = svg.querySelector("#flight-trail-reveal");
  const mask = svg.querySelector("#flight-trail-mask");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let routeLength = 0;
  let belgiumDistance = 0;
  let currentVehicle = "plane";
  const carPreview = new Image();
  carPreview.src = "images/car.png";
  let flightFrame;

  const departure = layout.querySelector(".journey-departure");
  const arrival = layout.querySelector(".journey-arrival");
  const departureMap = departure.querySelector(".country-map");
  const arrivalMap = arrival.querySelector(".country-map");
  const belgiumMap = layout.querySelector(".country-map-belgium");

  const stops = [...layout.querySelectorAll(".journey-stop")];

  function updateFlight() {
    if (!routeLength) return;

    let distance;

    if (reduceMotion.matches) {
      distance = routeLength;
    } else {
      const bounds = layout.getBoundingClientRect();
      const layoutTop = bounds.top + window.scrollY;

      const startPoint = path.getPointAtLength(0);
      const endPoint = path.getPointAtLength(routeLength);

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      const startScroll = Math.min(
        maxScroll,
        Math.max(0, layoutTop + startPoint.y - window.innerHeight * 0.35),
      );

      const endScroll = Math.min(
        maxScroll,
        layoutTop + endPoint.y - window.innerHeight * 0.35,
      );

      const progress =
        endScroll > startScroll
          ? Math.min(
              1,
              Math.max(
                0,
                (window.scrollY - startScroll) / (endScroll - startScroll),
              ),
            )
          : 1;

      const targetY = startPoint.y + progress * (endPoint.y - startPoint.y);

      let low = 0;
      let high = routeLength;

      for (let step = 0; step < 20; step++) {
        const middle = (low + high) / 2;
        const point = path.getPointAtLength(middle);

        if (point.y < targetY) {
          low = middle;
        } else {
          high = middle;
        }
      }

      distance = (low + high) / 2;
    }

    const point = path.getPointAtLength(distance);

    traveler.style.left = `${point.x}px`;
    traveler.style.top = `${point.y}px`;

    const driving = distance >= belgiumDistance;

    const nextVehicle = driving ? "car" : "plane";

    if (nextVehicle !== currentVehicle) {
      travelerImage.src = driving ? "images/about/car.png" : "images/about/plane.png";

      currentVehicle = nextVehicle;
    }

    const segmentStart = driving ? belgiumDistance : 0;
    const segmentLength = driving
      ? routeLength - belgiumDistance
      : belgiumDistance;

    const segmentProgress = Math.min(
      1,
      Math.max(0, (distance - segmentStart) / Math.max(1, segmentLength)),
    );

    const takeoff = Math.min(1, segmentProgress / 0.12);
    const landing = Math.min(1, (1 - segmentProgress) / 0.12);
    const sizeProgress = Math.min(takeoff, landing);

    const easedSize = sizeProgress * sizeProgress * (3 - 2 * sizeProgress);
    const scale = 0.35 + easedSize * 0.65;

    traveler.style.transform = `translate(-50%, -50%) scale(${scale})`;

    const before = path.getPointAtLength(Math.max(0, distance - 4));

    const after = path.getPointAtLength(Math.min(routeLength, distance + 4));

    const horizontalDirection = after.x - before.x;

    if (Math.abs(horizontalDirection) > 0.5) {
      travelerImage.style.transform =
        horizontalDirection > 0 ? "scaleX(-1)" : "scaleX(1)";
    }

    reveal.style.strokeDashoffset = `${routeLength - distance}`;
  }

  function scheduleFlightUpdate() {
    cancelAnimationFrame(flightFrame);
    flightFrame = requestAnimationFrame(updateFlight);
  }

  function getMapPoint(image) {
    let x = image.offsetWidth / 2;
    let y = image.offsetHeight / 2;
    let element = image;

    while (element && element !== layout) {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    }

    return { x, y };
  }

  function drawRoute() {
    const width = layout.clientWidth;
    const height = layout.offsetHeight;
    const mobile = window.matchMedia("(max-width: 800px)").matches;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const points = [
      getMapPoint(departureMap),

      ...stops.slice(0, 3).map((stop, index) => ({
        x: mobile ? 32 : width * (index % 2 === 0 ? 0.75 : 0.25),
        y: stop.offsetTop + stop.offsetHeight / 2,
      })),

      getMapPoint(belgiumMap),

      {
        x: mobile ? 32 : width * 0.75,
        y: stops[4].offsetTop + stops[4].offsetHeight / 2,
      },

      getMapPoint(arrivalMap),
    ];

    let route = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const next = points[index];
      const middleY = (previous.y + next.y) / 2;

      route += ` C ${previous.x} ${middleY}, ${next.x} ${middleY}, ${next.x} ${next.y}`;

      if (index === 4) {
        path.setAttribute("d", route);
        belgiumDistance = path.getTotalLength();
      }
    }

    path.setAttribute("d", route);
    reveal.setAttribute("d", route);

    mask.setAttribute("width", width);
    mask.setAttribute("height", height);

    routeLength = path.getTotalLength();

    reveal.style.strokeDasharray = `${routeLength} ${routeLength}`;

    updateFlight();
  }

  let scheduledFrame;

  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(scheduledFrame);
    scheduledFrame = requestAnimationFrame(drawRoute);
  });

  window.addEventListener("scroll", scheduleFlightUpdate, {
    passive: true,
  });

  window.addEventListener("resize", scheduleFlightUpdate);

  reduceMotion.addEventListener("change", scheduleFlightUpdate);

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const storyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          storyObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    stops.forEach((stop) => {
      stop.classList.add("story-reveal");
      storyObserver.observe(stop);
    });

    reduceMotion.addEventListener("change", (event) => {
      if (!event.matches) return;

      stops.forEach((stop) => {
        stop.classList.add("is-visible");
      });

      storyObserver.disconnect();
    });
  }

  observer.observe(layout);
  drawRoute();
})();

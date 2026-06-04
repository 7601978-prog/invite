const revealItems = document.querySelectorAll(".reveal");
const rsvpForm = document.querySelector("[data-rsvp-form]");
const statusNode = document.querySelector("[data-form-status]");
const submittedAtInput = document.querySelector("[data-submitted-at]");
const googleScriptUrl = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
const hero = document.querySelector(".hero");
const heroVideo = document.querySelector("[data-hero-video]");
const storyVideos = document.querySelectorAll("[data-story-video]");
const atmosphereCanvas = document.querySelector("[data-atmosphere]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

document.documentElement.classList.toggle("is-touch-device", isTouchDevice);
document.documentElement.classList.toggle("prefers-reduced-motion", prefersReducedMotion);

function prepareRevealStagger() {
  const animatedChildren = document.querySelectorAll(
    [
      "section:not(.hero) .section-inner > .eyebrow",
      "section:not(.hero) .section-inner > h2",
      "section:not(.hero) .section-inner > p",
      "section:not(.hero) .concept-grid > *",
      "section:not(.hero) .detail-card",
      "section:not(.hero) .time-mark",
      "section:not(.hero) .button",
      "section:not(.hero) .palette > *",
      "section:not(.hero) .mood-tile",
      "section:not(.hero) .feelings-grid > *",
      "section:not(.hero) .rsvp-form > label",
      "section:not(.hero) .rsvp-form > fieldset",
      "section:not(.hero) .rsvp-form > .form-row",
      "section:not(.hero) .rsvp-form > button",
      "section:not(.hero) .form-status",
      ".finale__content > *",
    ].join(", ")
  );

  animatedChildren.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 42, 420)}ms`);
  });
}

prepareRevealStagger();

function revealVisibleItems() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) return;

    const rect = item.getBoundingClientRect();
    const revealOffset = isTouchDevice ? 36 : 76;

    if (rect.top < viewportHeight - revealOffset && rect.bottom > revealOffset) {
      item.classList.add("is-visible");
    }
  });
}

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: isTouchDevice ? 0.06 : 0.18,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
  window.addEventListener("scroll", revealVisibleItems, { passive: true });
  window.addEventListener("resize", revealVisibleItems);
  revealVisibleItems();
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

async function initHeroVideo() {
  if (!hero || !heroVideo || prefersReducedMotion) return;

  const sources = [
    { src: "./assets/hero-bg.webm", type: "video/webm" },
    { src: "./assets/hero-bg.mp4", type: "video/mp4" },
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.src, { method: "HEAD" });
      if (!response.ok) continue;

      const node = document.createElement("source");
      node.src = source.src;
      node.type = source.type;
      heroVideo.append(node);
      heroVideo.load();
      await heroVideo.play().catch(() => {});
      hero.classList.add("has-video");
      return;
    } catch (error) {
      // Optional background video: the image-based hero stays active if no file exists.
    }
  }
}

function initStoryVideos() {
  if (!storyVideos.length) return;

  const playVideo = (video) => {
    if (prefersReducedMotion) return;
    video.play?.().catch(() => {});
  };

  storyVideos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.addEventListener("loadeddata", () => playVideo(video), { once: true });
  });

  if (!("IntersectionObserver" in window)) {
    storyVideos.forEach(playVideo);
    return;
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          playVideo(video);
        } else {
          video.pause?.();
        }
      });
    },
    { threshold: 0.24 }
  );

  storyVideos.forEach((video) => videoObserver.observe(video));
}

function moveLivingScene(clientX, clientY) {
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width - 0.5) * 14;
  const y = ((clientY - rect.top) / rect.height - 0.5) * 10;

  hero.style.setProperty("--scene-x", `${x.toFixed(2)}px`);
  hero.style.setProperty("--scene-y", `${y.toFixed(2)}px`);
}

if (!isTouchDevice && !prefersReducedMotion) {
  hero?.addEventListener("pointermove", (event) => {
    moveLivingScene(event.clientX, event.clientY);
  });

  hero?.addEventListener("pointerleave", () => {
    hero.style.setProperty("--scene-x", "0px");
    hero.style.setProperty("--scene-y", "0px");
  });
}

if (!isTouchDevice && !prefersReducedMotion) {
  window.addEventListener("deviceorientation", (event) => {
    if (!hero || event.gamma === null || event.beta === null) return;

    const x = Math.max(-8, Math.min(8, event.gamma * 0.45));
    const y = Math.max(-6, Math.min(6, (event.beta - 45) * 0.18));

    hero.style.setProperty("--scene-x", `${x.toFixed(2)}px`);
    hero.style.setProperty("--scene-y", `${y.toFixed(2)}px`);
  });
}

function initAtmosphere() {
  if (!atmosphereCanvas || prefersReducedMotion) {
    return;
  }

  const context = atmosphereCanvas.getContext("2d");
  if (!context) return;

  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, isTouchDevice ? 1.5 : 2);
    const rect = atmosphereCanvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    atmosphereCanvas.width = Math.floor(width * ratio);
    atmosphereCanvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles.length = 0;
    const count = Math.round(
      isTouchDevice
        ? Math.min(42, Math.max(18, width / 18))
        : Math.min(90, Math.max(34, width / 10))
    );

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (isTouchDevice ? 1.2 : 1.8) + 0.4,
        speed: Math.random() * (isTouchDevice ? 0.14 : 0.22) + 0.04,
        drift: Math.random() * 0.18 - 0.09,
        alpha: Math.random() * (isTouchDevice ? 0.22 : 0.34) + 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";

    particles.forEach((particle) => {
      particle.y -= particle.speed;
      particle.x += Math.sin(time * 0.0006 + particle.phase) * 0.08 + particle.drift;

      if (particle.y < -12) {
        particle.y = height + 12;
        particle.x = Math.random() * width;
      }

      if (particle.x < -12) particle.x = width + 12;
      if (particle.x > width + 12) particle.x = -12;

      const pulse = 0.65 + Math.sin(time * 0.0012 + particle.phase) * 0.35;
      const gradient = context.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius * 9
      );

      gradient.addColorStop(0, `rgba(255, 219, 151, ${particle.alpha * pulse})`);
      gradient.addColorStop(1, "rgba(255, 165, 70, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * 9, 0, Math.PI * 2);
      context.fill();
    });

    animationFrame = requestAnimationFrame(draw);
  }

  resize();
  animationFrame = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame), { once: true });
}

initHeroVideo();
initStoryVideos();
initAtmosphere();

function setFormStatus(message, type = "") {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.classList.toggle("is-error", type === "error");
  statusNode.classList.toggle("is-success", type === "success");
}

async function sendRsvp(event) {
  event.preventDefault();

  if (!rsvpForm) return;

  if (googleScriptUrl.includes("PASTE_GOOGLE_APPS_SCRIPT")) {
    setFormStatus(
      "Спасибо. Сейчас форма работает в тестовом режиме, поэтому, пожалуйста, продублируйте ответ в WhatsApp.",
      "error"
    );
    return;
  }

  const submitButton = rsvpForm.querySelector("button[type='submit']");
  submittedAtInput.value = new Date().toISOString();
  submitButton.disabled = true;
  setFormStatus("Отправляем ответ...");

  try {
    await fetch(googleScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.fromEntries(new FormData(rsvpForm))),
    });

    rsvpForm.reset();
    setFormStatus(
      "Спасибо, ваш ответ сохранен. Будем ждать встречи под теплым светом фонарей.",
      "success"
    );
  } catch (error) {
    setFormStatus(
      "Не получилось отправить ответ. Попробуйте еще раз или напишите нам в WhatsApp.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
  }
}

rsvpForm?.addEventListener("submit", sendRsvp);

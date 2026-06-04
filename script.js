const revealItems = document.querySelectorAll(".reveal");
const rsvpForm = document.querySelector("[data-rsvp-form]");
const statusNode = document.querySelector("[data-form-status]");
const submittedAtInput = document.querySelector("[data-submitted-at]");
const whatsappNumber = "79995835754";
const hero = document.querySelector(".hero");
const atmosphereCanvas = document.querySelector("[data-atmosphere]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

function moveLivingScene(clientX, clientY) {
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width - 0.5) * 14;
  const y = ((clientY - rect.top) / rect.height - 0.5) * 10;

  hero.style.setProperty("--scene-x", `${x.toFixed(2)}px`);
  hero.style.setProperty("--scene-y", `${y.toFixed(2)}px`);
}

hero?.addEventListener("pointermove", (event) => {
  moveLivingScene(event.clientX, event.clientY);
});

hero?.addEventListener("pointerleave", () => {
  hero.style.setProperty("--scene-x", "0px");
  hero.style.setProperty("--scene-y", "0px");
});

window.addEventListener("deviceorientation", (event) => {
  if (!hero || event.gamma === null || event.beta === null) return;

  const x = Math.max(-8, Math.min(8, event.gamma * 0.45));
  const y = Math.max(-6, Math.min(6, (event.beta - 45) * 0.18));

  hero.style.setProperty("--scene-x", `${x.toFixed(2)}px`);
  hero.style.setProperty("--scene-y", `${y.toFixed(2)}px`);
});

function initAtmosphere() {
  if (!atmosphereCanvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const context = atmosphereCanvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = atmosphereCanvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    atmosphereCanvas.width = Math.floor(width * ratio);
    atmosphereCanvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles.length = 0;
    const count = Math.round(Math.min(90, Math.max(34, width / 10)));

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.22 + 0.05,
        drift: Math.random() * 0.18 - 0.09,
        alpha: Math.random() * 0.34 + 0.08,
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

  const submitButton = rsvpForm.querySelector("button[type='submit']");
  if (submittedAtInput) {
    submittedAtInput.value = new Date().toISOString();
  }
  submitButton.disabled = true;
  setFormStatus("Открываем WhatsApp...");

  const formData = Object.fromEntries(new FormData(rsvpForm));
  const message = [
    "RSVP: свадьба Roman & Liza",
    `Имя: ${formData.guestName || "-"}`,
    `Телефон: ${formData.phone || "-"}`,
    `Присутствие: ${formData.attendance || "-"}`,
    `Количество гостей: ${formData.guestCount || "-"}`,
    `Трансфер: ${formData.transfer || "-"}`,
    `Комментарий: ${formData.comment || "-"}`,
  ].join("\n");

  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  setFormStatus("Спасибо! WhatsApp открылся с готовым сообщением.");
  submitButton.disabled = false;
}

rsvpForm?.addEventListener("submit", sendRsvp);

document.documentElement.classList.add("js-ready");

/**
 * WhatsApp: número internacional sin + ni espacios.
 * Ecuador +593 95 907 8313 → 593959078313.
 * Si cambias el número, actualiza también los enlaces wa.me en index.html (href).
 */
const WHATSAPP_NUMBER = "593959078313";

/** Un solo mensaje para todos los enlaces a WhatsApp (cotización o consulta). */
const WHATSAPP_MESSAGE =
  "Hola, quiero contactar con Gardeborn para cotización o información.";

function initWhatsAppLinks() {
  const digits = String(WHATSAPP_NUMBER).replace(/\D/g, "");
  if (!digits) return;
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  document.querySelectorAll("a[data-wa]").forEach((a) => {
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
}

function initCurrentYear() {
  const yearEl = document.getElementById("current-year");
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
}

const nav = document.getElementById("site-nav");
const navToggle = document.querySelector(".nav-toggle");
const subToggles = document.querySelectorAll(".site-nav__sub-toggle");
const siteHeader = document.querySelector(".site-header");
const navBackdrop = document.querySelector(".site-header__backdrop");

function initHeaderOnScroll() {
  if (!siteHeader) return;

  const toggleScrolledHeader = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  toggleScrolledHeader();
  window.addEventListener("scroll", toggleScrolledHeader, { passive: true });
}

function closeNav() {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú");
  if (navBackdrop) navBackdrop.hidden = true;
  document.body.style.overflow = "";
}

function toggleNav() {
  if (!nav || !navToggle) return;
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  if (navBackdrop) navBackdrop.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

navToggle?.addEventListener("click", toggleNav);
navBackdrop?.addEventListener("click", closeNav);

subToggles.forEach((btn) => {
  const item = btn.closest(".site-nav__item--sub");
  btn.addEventListener("click", () => {
    const isOpen = item?.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(!!isOpen));
  });
});

window.addEventListener("resize", () => {
  if (nav?.classList.contains("is-open")) {
    closeNav();
    document.querySelectorAll(".site-nav__item--sub").forEach((el) => {
      el.classList.remove("is-open");
    });
    subToggles.forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});

function resetSubmenus() {
  document.querySelectorAll(".site-nav__item--sub").forEach((el) => {
    el.classList.remove("is-open");
  });
  subToggles.forEach((b) => b.setAttribute("aria-expanded", "false"));
}

nav?.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link || !nav.contains(link)) return;
  const hash = link.getAttribute("href");
  if (!hash || hash === "#") return;
  if (!document.querySelector(hash)) return;
  closeNav();
  resetSubmenus();
});

function initHeroCarousel() {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) return;

  const viewport = root.querySelector(".hero-carousel__viewport");
  const track = root.querySelector(".hero-carousel__track");
  const slides = [...root.querySelectorAll(".hero-carousel__slide")];
  const prevBtn = root.querySelector(".hero-carousel__arrow--prev");
  const nextBtn = root.querySelector(".hero-carousel__arrow--next");
  const dotsRoot = root.querySelector(".hero-carousel__dots");
  const statusEl = root.querySelector(".hero-carousel__status");

  if (
    !viewport ||
    !track ||
    slides.length === 0 ||
    !prevBtn ||
    !nextBtn ||
    !dotsRoot
  ) {
    return;
  }

  const total = slides.length;
  let index = 0;
  let touchStartX = 0;
  let autoplayTimer = null;
  let suspendAutoplay = false;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getAutoplayDelayMs() {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--carousel-autoplay-ms")
      .trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 5500;
  }

  function clearAutoplayTimer() {
    if (autoplayTimer !== null) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function applyTransition() {
    track.style.transition = reduceMotion()
      ? "none"
      : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
  }

  function updateVisuals(options) {
    const announce = options?.announce === true;
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });

    dotsRoot.querySelectorAll(".hero-carousel__dot").forEach((btn, i) => {
      const on = i === index;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });

    if (statusEl && announce) {
      statusEl.textContent = `Diapositiva ${index + 1} de ${total}`;
    }
  }

  function scheduleAutoplay() {
    clearAutoplayTimer();
    if (suspendAutoplay || reduceMotion() || document.hidden) return;
    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = null;
      index = (index + 1 + total) % total;
      applyTransition();
      updateVisuals({ announce: false });
      scheduleAutoplay();
    }, getAutoplayDelayMs());
  }

  function go(delta, userInitiated) {
    if (userInitiated) clearAutoplayTimer();
    index = (index + delta + total) % total;
    applyTransition();
    updateVisuals({ announce: userInitiated });
    if (userInitiated) scheduleAutoplay();
  }

  function goTo(i, userInitiated) {
    if (userInitiated) clearAutoplayTimer();
    index = ((i % total) + total) % total;
    applyTransition();
    updateVisuals({ announce: userInitiated });
    if (userInitiated) scheduleAutoplay();
  }

  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hero-carousel__dot";
    btn.setAttribute("aria-label", `Ir a la diapositiva ${i + 1}`);
    btn.setAttribute("aria-current", i === 0 ? "true" : "false");
    btn.addEventListener("click", () => goTo(i, true));
    dotsRoot.appendChild(btn);
  });

  prevBtn.addEventListener("click", () => go(-1, true));
  nextBtn.addEventListener("click", () => go(1, true));

  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1, true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1, true);
    }
  });

  viewport.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) < 48) return;
      if (dx < 0) go(1, true);
      else go(-1, true);
    },
    { passive: true }
  );

  root.addEventListener("mouseenter", () => {
    suspendAutoplay = true;
    clearAutoplayTimer();
  });

  root.addEventListener("mouseleave", () => {
    suspendAutoplay = false;
    scheduleAutoplay();
  });

  root.addEventListener("focusin", () => {
    suspendAutoplay = true;
    clearAutoplayTimer();
  });

  root.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (!root.contains(document.activeElement)) {
        suspendAutoplay = false;
        scheduleAutoplay();
      }
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearAutoplayTimer();
    else scheduleAutoplay();
  });

  applyTransition();
  updateVisuals({ announce: true });
  scheduleAutoplay();

  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", () => {
      applyTransition();
      clearAutoplayTimer();
      if (!reduceMotion()) scheduleAutoplay();
    });
}

function initRevealOnScroll() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    els.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  document.documentElement.classList.add("js-reveal-active");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -6% 0px",
      threshold: 0.06,
    }
  );

  function revealIfInView(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const margin = vh * 0.06;
    return r.top < vh - margin && r.bottom > margin;
  }

  els.forEach((el) => {
    if (revealIfInView(el)) el.classList.add("is-revealed");
    else observer.observe(el);
  });
}

initRevealOnScroll();
initHeroCarousel();
initWhatsAppLinks();
initHeaderOnScroll();
initCurrentYear();

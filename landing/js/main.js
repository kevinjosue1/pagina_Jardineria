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
}

function toggleNav() {
  if (!nav || !navToggle) return;
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

navToggle?.addEventListener("click", toggleNav);

subToggles.forEach((btn) => {
  const item = btn.closest(".site-nav__item--sub");
  btn.addEventListener("click", () => {
    if (window.matchMedia("(min-width: 960px)").matches) return;
    const isOpen = item?.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(!!isOpen));
  });
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 960px)").matches) {
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
initWhatsAppLinks();
initHeaderOnScroll();
initCurrentYear();

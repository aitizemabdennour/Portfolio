/* ============================================================
   Portfolio interactions — pure Vanilla JS (ES6+)
   ============================================================ */

/* ---------- i18n: apply before first paint to avoid flash ---------- */
import { initI18n } from "./i18n.js";
initI18n();

(() => {
  "use strict";

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    if (!pre) return;
    setTimeout(() => pre.classList.add("is-done"), 500);
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 24);

    const bar = document.getElementById("scrollProgress");
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${(window.scrollY / (h || 1)) * 100}%`;
    }

    document.getElementById("toTop")?.classList.toggle(
      "is-visible",
      window.scrollY > 500
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  burger?.addEventListener("click", () => {
    burger.classList.toggle("is-open");
    links?.classList.toggle("is-open");
  });
  links?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger?.classList.remove("is-open");
      links?.classList.remove("is-open");
    })
  );

  /* ---------- Active link on scroll (IntersectionObserver) ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link");
  const linkMap = new Map();
  navLinks.forEach((l) => linkMap.set(l.getAttribute("href"), l));

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          linkMap.get(`#${e.target.id}`)?.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObs.observe(el));

  /* ---------- Skill bars & language bars ---------- */
  const barEls = document.querySelectorAll(".skill-card, .lang");
  const barObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  barEls.forEach((el) => barObs.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => countObs.observe(c));

  /* ---------- Typing effect (reads roles from data-i18n-roles) ---------- */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    let phrases = [];
    let pi = 0;
    let ci = 0;
    let deleting = false;
    let timer = null;

    const loadPhrases = () => {
      try {
        phrases = JSON.parse(typedEl.dataset.roles || "[]");
      } catch {
        phrases = [];
      }
      if (!phrases.length) phrases = [""];
      pi = 0;
      ci = 0;
      deleting = false;
      if (timer) clearTimeout(timer);
      type();
    };

    const type = () => {
      const word = phrases[pi] || "";
      typedEl.textContent = word.slice(0, ci);

      if (!deleting && ci < word.length) {
        ci++;
        timer = setTimeout(type, 55);
      } else if (deleting && ci > 0) {
        ci--;
        timer = setTimeout(type, 28);
      } else {
        if (!deleting) {
          deleting = true;
          timer = setTimeout(type, 1600);
        } else {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          timer = setTimeout(type, 350);
        }
      }
    };

    loadPhrases();
    document.addEventListener("languagechange", loadPhrases);
  }

  /* ---------- Project filtering ---------- */
  const filters = document.getElementById("projectFilters");
  const cards = document.querySelectorAll(".project-card");
  filters?.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    filters.querySelectorAll(".filter").forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      const cats = c.dataset.category || "";
      c.classList.toggle("is-hidden", f !== "all" && !cats.includes(f));
    });
  });

  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById("cursor");
  const dot = document.getElementById("cursorDot");
  if (cursor && dot && window.matchMedia("(hover: hover)").matches) {
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll("a, button, .skill-card, .project-card, .cert").forEach(
      (el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
      }
    );
  }

  /* ---------- Back to top ---------- */
  document.getElementById("toTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Download CV (placeholder) ---------- */
 /* ---------- Download CV (Version simplifiée et fiable) ---------- */
/* ---------- Download CV (Méthode directe) ---------- */
/* ---------- Download CV (Forcer le téléchargement) ---------- */
/*document.getElementById("downloadCv")?.addEventListener("click", (e) => {
  e.preventDefault();
  
  const link = document.createElement("a");
  link.href = "/CV_Abdennour_Ait_Izem.pdf"; // Assurez-vous que le fichier est dans le dossier 'public'
  link.setAttribute("download", "Abdennour_AIT_IZEM_CV.pdf"); // C'est ici que l'on force le nom et le téléchargement
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
*/
  /* ---------- Contact form (uses i18n strings) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");

  const t = (key) => {
    const el = document.querySelector(`[data-i18n="${key}"]`);
    return el ? el.textContent : key;
  };

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Nettoyer le statut dès le clic pour éviter les conflits visuels
    status.textContent = "";
    status.className = "contact__status";

    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const message = form.querySelector("#message").value.trim();

    if (!name || !email || !message) {
      status.textContent = t("contact.errorEmpty");
      status.className = "contact__status err";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = t("contact.errorEmail");
      status.className = "contact__status err";
      return;
    }

    status.textContent = t("contact.sending");
    status.className = "contact__status";

    const formData = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.textContent = t("contact.success");
        status.className = "contact__status ok";
        form.reset();

      // Vider le message de succès après 5 secondes
      setTimeout(() => {
        status.textContent = "";
        status.className = "contact__status";
      }, 5000);
      } else {
        throw new Error("Erreur");
      }
    } catch (error) {
      status.textContent = "Erreur lors de l'envoi.";
      status.className = "contact__status err";
    }

      });
})();

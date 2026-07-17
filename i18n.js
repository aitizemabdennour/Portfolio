/* ============================================================
   i18n module — language detection, RTL switching, DOM updates
   Pure Vanilla JS (ES6+). Depends on translations.js.
   ============================================================ */

import { translations, supportedLanguages, defaultLanguage } from "./translations.js";

const STORAGE_KEY = "portfolio-lang";

/** Resolve a dotted key path against the translations object. */
function resolve(lang, key) {
  return key.split(".").reduce((obj, k) => (obj ? obj[k] : undefined), translations[lang]);
}

/** Detect browser language and match against supported languages. */
function detectLanguage() {
  const nav = navigator.language || navigator.userLanguage || "en";
  const lower = nav.toLowerCase();
  const match = supportedLanguages.find((l) => lower.startsWith(l.code));
  return match ? match.code : defaultLanguage;
}

/** Get stored language or detect on first visit. */
export function getLanguage() {
  return localStorage.getItem(STORAGE_KEY) || detectLanguage();
}

/** Persist language choice. */
export function setLanguage(code) {
  if (!supportedLanguages.some((l) => l.code === code)) return;
  localStorage.setItem(STORAGE_KEY, code);
  applyLanguage(code);
}

/** Apply a language to the entire document: attributes, text, RTL. */
export function applyLanguage(code) {
  const lang = supportedLanguages.find((l) => l.code === code) || supportedLanguages[0];
  const dict = translations[lang.code];
  if (!dict) return;

  const html = document.documentElement;
  html.setAttribute("lang", lang.code);
  html.setAttribute("dir", lang.dir);
  html.classList.toggle("rtl", lang.dir === "rtl");

  document.title = dict.meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", dict.meta.description);

    const downloadCvBtn = document.getElementById("downloadCv");
    if (downloadCvBtn) {
      const cvPath = resolve(lang.code, "hero.cvPath");
      if (cvPath) {
        downloadCvBtn.setAttribute("href", cvPath);
      }
    }
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = resolve(lang.code, key);
    if (typeof value === "string") el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const pairs = el.getAttribute("data-i18n-attr").split(",");
    pairs.forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      const value = resolve(lang.code, key);
      if (typeof value === "string") el.setAttribute(attr, value);
    });
  });

  document.querySelectorAll("[data-i18n-roles]").forEach((el) => {
    const roles = resolve(lang.code, el.getAttribute("data-i18n-roles"));
    if (Array.isArray(roles)) el.dataset.roles = JSON.stringify(roles);
  });

  document.dispatchEvent(new CustomEvent("languagechange", { detail: { code: lang.code } }));
}

/** Build the language selector dropdown in the navbar. */
export function initLanguageSelector() {
  const container = document.getElementById("langSelector");
  if (!container) return;

  const current = getLanguage();
  const currentLang = supportedLanguages.find((l) => l.code === current);

  container.innerHTML = `
    <button class="lang-btn" id="langBtn" aria-label="${currentLang.label}" aria-haspopup="true" aria-expanded="false">
      <span class="lang-btn__code">${currentLang.short}</span>
      <svg class="lang-btn__chevron" viewBox="0 0 24 24" width="14" height="14"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
    </button>
    <ul class="lang-menu" id="langMenu" role="menu">
      ${supportedLanguages
        .map(
          (l) => `
        <li role="none">
          <button class="lang-option ${l.code === current ? "active" : ""}" role="menuitem" data-lang="${l.code}">
            <span class="lang-option__short">${l.short}</span>
            <span class="lang-option__label">${l.label}</span>
          </button>
        </li>`
        )
        .join("")}
    </ul>
  `;

  const btn = container.querySelector("#langBtn");
  const menu = container.querySelector("#langMenu");

  const close = () => {
    menu.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) close();
  });

  menu.addEventListener("click", (e) => {
    const opt = e.target.closest(".lang-option");
    if (!opt) return;
    const code = opt.dataset.lang;
    setLanguage(code);
    close();
    const lang = supportedLanguages.find((l) => l.code === code);
    btn.querySelector(".lang-btn__code").textContent = lang.short;
    btn.setAttribute("aria-label", lang.label);
    menu.querySelectorAll(".lang-option").forEach((o) =>
      o.classList.toggle("active", o.dataset.lang === code)
    );
  });
}

/** Initialize i18n on page load. */
export function initI18n() {
  const code = getLanguage();
  applyLanguage(code);
  initLanguageSelector();
}

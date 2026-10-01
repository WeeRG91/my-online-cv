const translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About me",
    "nav.projects": "Projects",
    "nav.experience": "Experience",
    "nav.contact": "Contact",

    "hero.greeting": "Hello, I'm",
    "hero.role": "Full-stack developer",

    "settings.language": "Language",
    "settings.theme": "Theme",

    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.cupcake": "Cupcake",
    "theme.luxury": "Luxury",

    "menu.open": "Menu",
    "menu.close": "Close",
  },

  fr: {
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.projects": "Projets",
    "nav.experience": "Expérience",
    "nav.contact": "Contact",

    "hero.greeting": "Bonjour, je m'appelle",
    "hero.role": "Développeur full-stack",

    "settings.language": "Langue",
    "settings.theme": "Thème",

    "theme.light": "Clair",
    "theme.dark": "Sombre",
    "theme.cupcake": "Cupcake",
    "theme.luxury": "Luxury",

    "menu.open": "Menu",
    "menu.close": "Fermer",
  },

  th: {
    "nav.home": "หน้าแรก",
    "nav.about": "เกี่ยวกับฉัน",
    "nav.projects": "ผลงาน",
    "nav.experience": "ประสบการณ์",
    "nav.contact": "ติดต่อ",

    "hero.greeting": "สวัสดีค่ะ ฉันชื่อ",
    "hero.role": "นักพัฒนาเว็บ full-stack",

    "settings.language": "ภาษา",
    "settings.theme": "ธีม",

    "theme.light": "สว่าง",
    "theme.dark": "มืด",
    "theme.cupcake": "Cupcake",
    "theme.luxury": "Luxury",

    "menu.open": "เมนู",
    "menu.close": "ปิด",
  },
};

(() => {
  const storageKey = "cv-language";
  const dropdown = document.querySelector("#language-dropdown");
  const trigger = dropdown.querySelector("summary");
  const choices = dropdown.querySelectorAll('input[name="language-choice"]');

  let currentLanguage = "en";

  function translate(key) {
    return translations[currentLanguage][key] ?? translations.en[key] ?? key;
  }

  function applyLanguage(language) {
    currentLanguage = Object.hasOwn(translations, language) ? language : "en";

    document.documentElement.lang = currentLanguage;

    choices.forEach((choice) => {
      choice.checked = choice.value === currentLanguage;
    });

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = translate(element.dataset.i18n);
    });

    const button = document.querySelector(".menu-toggle");
    const open = button.getAttribute("aria-expanded") === "true";

    button.textContent = translate(open ? "menu.close" : "menu.open");
  }

  window.cvI18n = { translate };

  let savedLanguage = "en";

  try {
    savedLanguage = localStorage.getItem(storageKey) || "en";
  } catch {
    // Switching still works without storage.
  }

  applyLanguage(savedLanguage);

  choices.forEach((choice) => {
    choice.addEventListener("change", () => {
      if (!choice.checked) return;

      applyLanguage(choice.value);

      try {
        localStorage.setItem(storageKey, currentLanguage);
      } catch {
        // The language still applies for this visit.
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.open = false;
    }
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape" || !dropdown.open) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      dropdown.open = false;
      trigger.focus();
    },
    true,
  );

  const dropdowns = document.querySelectorAll(".settings-dropdown");

  dropdowns.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open) return;

      dropdowns.forEach((other) => {
        if (other !== panel) other.open = false;
      });
    });
  });
})();

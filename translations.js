const translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About me",
    "nav.projects": "Projects",
    "nav.experience": "Experience",
    "nav.contact": "Contact",

    "hero.greeting": "Hello, I'm",
    "hero.role": "Full-stack developer",
    "hero.description":
      "Software development student based in Belgium, seeking an internship in web and mobile app development for my final-year project. With a background in language teaching and French–Thai translation, I’m bringing a new perspective to my career in technology.",

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
    "hero.description":
      "Étudiante en développement logiciel en Belgique, je recherche un stage en développement d’applications web et mobiles dans le cadre de mon projet de fin d’études. Forte d’une expérience dans l’enseignement des langues et la traduction français–thaï, j’apporte une nouvelle perspective à mon parcours dans la technologie.",

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
    "hero.description":
      "ฉันกำลังศึกษาด้านการพัฒนาซอฟต์แวร์ในเบลเยียม และกำลังมองหาโอกาสฝึกงานด้านการพัฒนาเว็บและแอปพลิเคชันมือถือเพื่อทำโครงงานจบการศึกษา ด้วยประสบการณ์ด้านการสอนภาษาและการแปลภาษาฝรั่งเศส–ไทย ฉันพร้อมนำมุมมองใหม่มาสู่เส้นทางอาชีพด้านเทคโนโลยี",

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

    button.setAttribute(
      "aria-label",
      translate(open ? "menu.close" : "menu.open"),
    );
  }

  window.cvI18n = { translate };

  let savedLanguage = "en";

  try {
    savedLanguage = localStorage.getItem(storageKey) || "en";
  } catch {
    //
  }

  applyLanguage(savedLanguage);

  choices.forEach((choice) => {
    choice.addEventListener("change", () => {
      if (!choice.checked) return;

      applyLanguage(choice.value);

      try {
        localStorage.setItem(storageKey, currentLanguage);
      } catch {
        //
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

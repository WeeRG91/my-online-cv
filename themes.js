(() => {
    const availableThemes = ["light", "dark", "cupcake", "luxury"];
    const storageKey = "cv-theme";

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(storageKey) || "light";
    } catch {
        // 
    }

    const initialTheme = availableThemes.includes(savedTheme)
        ? savedTheme
        : "light";

    document.documentElement.dataset.theme = initialTheme;

    document.addEventListener("DOMContentLoaded", () => {
        const selector = document.querySelector("#theme-select");

        selector.value = initialTheme;

        selector.addEventListener("change", () => {
            const theme = selector.value;

            if (!availableThemes.includes(theme)) return;

            document.documentElement.dataset.theme = theme;

            try {
                localStorage.setItem(storageKey, theme);
            } catch {
                // 
            }
        });
    });
})();
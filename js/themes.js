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
        const dropdown = document.querySelector("#theme-dropdown");
        const trigger = dropdown.querySelector("summary");
        const choices = dropdown.querySelectorAll(
            'input[name="theme-choice"]'
        );

        choices.forEach((choice) => {
            choice.checked = choice.value === initialTheme;

            choice.addEventListener("change", () => {
                if (!choice.checked) return;

                document.documentElement.dataset.theme = choice.value;

                try {
                    localStorage.setItem(storageKey, choice.value);
                } catch {
                    // 
                }

                // Keep the panel open so arrow keys can compare themes.
            });
        });

        document.addEventListener("click", (event) => {
            if (!dropdown.contains(event.target)) {
                dropdown.open = false;
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || !dropdown.open) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            dropdown.open = false;
            trigger.focus();
        }, true);
    });
})();
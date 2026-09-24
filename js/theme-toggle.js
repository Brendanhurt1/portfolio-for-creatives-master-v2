(() => {
  const themeKey = "brendan-hurt-theme";
  const root = document.documentElement;

  const savedTheme = () => {
    try {
      // Accept the previous names so existing visitors retain their chosen theme.
      const storedTheme = window.localStorage.getItem(themeKey);
      return storedTheme === "light" || storedTheme === "coral" ? "light" : "dark";
    } catch {
      return "dark";
    }
  };

  const applyTheme = (theme) => {
    if (theme === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;

    document.querySelectorAll(".project-thumbnail-overlay").forEach((thumbnail) => {
      const defaultSource = thumbnail.dataset.defaultSource || thumbnail.getAttribute("src");
      if (!defaultSource) return;
      thumbnail.dataset.defaultSource = defaultSource;
      const nextSource = theme === "light" && thumbnail.dataset.themeAltSource
        ? thumbnail.dataset.themeAltSource
        : thumbnail.dataset.defaultSource;
      if (thumbnail.dataset.currentSource === nextSource) return;

      const swapId = String(Number(thumbnail.dataset.swapId || 0) + 1);
      thumbnail.dataset.swapId = swapId;
      thumbnail.style.visibility = "hidden";

      const pendingImage = new Image();
      const reveal = () => {
        if (thumbnail.dataset.swapId !== swapId) return;
        thumbnail.src = nextSource;
        thumbnail.dataset.currentSource = nextSource;
        thumbnail.style.visibility = "visible";
      };

      pendingImage.addEventListener("load", reveal, { once: true });
      pendingImage.addEventListener("error", reveal, { once: true });
      pendingImage.src = nextSource;
    });

    document.querySelectorAll("[data-theme-main-src][data-theme-alt-src]").forEach((asset) => {
      asset.src = theme === "light" ? asset.dataset.themeAltSrc : asset.dataset.themeMainSrc;
    });

    const toggle = document.querySelector("#themeToggle");
    if (toggle) {
      const isLight = theme === "light";
      toggle.checked = isLight;
      toggle.setAttribute("aria-checked", String(isLight));
    }

    window.dispatchEvent(new CustomEvent("site-theme-change", { detail: { theme } }));
  };

  applyTheme(savedTheme());

  const initialiseToggle = () => {
    const toggle = document.querySelector("#themeToggle");
    const control = document.querySelector(".theme-switcher");

    if (!toggle || !control) return;

    // The control is added after the first saved-theme application in the page head.
    applyTheme(savedTheme());

    const syncTogglePosition = () => {
      // The control now lives in the responsive hero action row, so any
      // coordinates from the previous absolute-positioned layout must clear.
      control.style.removeProperty("top");
      control.style.removeProperty("right");
    };

    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "light" : "dark";
      try {
        window.localStorage.setItem(themeKey, theme);
      } catch {
        // Theme switching still works for this visit if storage is unavailable.
      }
      applyTheme(theme);
    });

    window.addEventListener("resize", () => window.requestAnimationFrame(syncTogglePosition));
    if (document.fonts?.ready) document.fonts.ready.then(syncTogglePosition);
    window.requestAnimationFrame(syncTogglePosition);
  };

  window.addEventListener("storage", (event) => {
    if (event.key === themeKey) {
      applyTheme(event.newValue === "light" || event.newValue === "coral" ? "light" : "dark");
    }
  });

  const initialisePageTheme = () => {
    applyTheme(savedTheme());
    initialiseToggle();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisePageTheme, { once: true });
  } else {
    initialisePageTheme();
  }
})();

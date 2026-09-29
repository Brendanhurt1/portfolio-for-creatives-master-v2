(() => {
  const initialise = () => {
    const navigation = document.querySelector(".site-navigation");
    if (!navigation) return;

    const isProjectPage = document.body.matches(".project-page.secondary-page:not(.more-of-my-work)");
    const syncProjectContentBounds = () => {
      if (!isProjectPage) return;

      const logo = navigation.querySelector(".home-nav-logo");
      const aboutButton = navigation.querySelector(".nav-branding > li:last-child");
      const logoBounds = logo?.getBoundingClientRect();
      const aboutBounds = aboutButton?.getBoundingClientRect();
      if (!logoBounds || !aboutBounds) return;

      document.documentElement.style.setProperty(
        "--project-content-left",
        `${Math.max(0, logoBounds.right)}px`
      );
      document.documentElement.style.setProperty(
        "--project-content-right",
        `${Math.max(0, window.innerWidth - aboutBounds.left)}px`
      );
    };

    const dockProjectNavigation = () => {
      if (!isProjectPage) return;

      const projectNavigation = navigation.querySelector(".project-page-navigation");
      const footer = document.querySelector(".footer-global");
      if (!projectNavigation || !footer || projectNavigation.parentElement?.classList.contains("project-footer-navigation")) return;

      const dock = document.createElement("div");
      dock.className = "project-footer-navigation";
      footer.before(dock);
      dock.append(projectNavigation);
    };

    dockProjectNavigation();
    const queueProjectContentBoundsSync = () => window.requestAnimationFrame(syncProjectContentBounds);
    queueProjectContentBoundsSync();
    window.addEventListener("resize", queueProjectContentBoundsSync);
    window.addEventListener("pageshow", queueProjectContentBoundsSync);
    if (document.fonts?.ready) document.fonts.ready.then(queueProjectContentBoundsSync);

    const directionThreshold = 8;
    let lastScrollY = Math.max(0, window.scrollY);
    let isTicking = false;

    const updateNavigation = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDistance = currentScrollY - lastScrollY;
      const revealZone = navigation.offsetHeight;

      if (currentScrollY <= revealZone) {
        navigation.classList.remove("is-scroll-hidden");
      } else if (scrollDistance > directionThreshold) {
        navigation.classList.add("is-scroll-hidden");
        lastScrollY = currentScrollY;
      } else if (scrollDistance < -directionThreshold) {
        navigation.classList.remove("is-scroll-hidden");
        lastScrollY = currentScrollY;
      }

      isTicking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (isTicking) return;
        isTicking = true;
        window.requestAnimationFrame(updateNavigation);
      },
      { passive: true }
    );

    navigation.addEventListener("focusin", () => {
      navigation.classList.remove("is-scroll-hidden");
    });

    window.addEventListener("pageshow", () => {
      lastScrollY = Math.max(0, window.scrollY);
      updateNavigation();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();

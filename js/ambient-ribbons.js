(() => {
  // Temporarily disabled. Set to true to restore particles on secondary pages.
  const ambientParticlesEnabled = false;
  if (!ambientParticlesEnabled) return;

  const initialiseAmbientRibbons = () => {
    if (document.querySelector(".ps3-ribbon-background")) return;

    document.body.insertAdjacentHTML(
      "afterbegin",
      `<svg class="ps3-ribbon-background" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        <g class="ps3-ribbon-particles"></g>
      </svg>`
    );

    const backdrop = document.querySelector(".ps3-ribbon-background");
    const particleLayer = backdrop.querySelector(".ps3-ribbon-particles");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const svgNamespace = "http://www.w3.org/2000/svg";

    const particles = Array.from({ length: 46 }, (_, index) => {
      const particle = document.createElementNS(svgNamespace, "circle");
      const seed = (index * 67.31) % 1;
      const particleData = {
        element: particle,
        x: seed * 1200,
        y: ((index * 41.73) % 1) * 800,
        speed: 0.00006 + ((index * 7.19) % 1) * 0.00009,
        drift: 7 + ((index * 19.83) % 1) * 18,
        phase: index * 0.73,
      };

      particle.setAttribute("r", `${0.75 + ((index * 13.17) % 1) * 1.65}`);
      particle.setAttribute("fill", "var(--color-blue)");
      particle.setAttribute("opacity", `${0.05 + ((index * 11.3) % 1) * 0.15}`);
      particleLayer.append(particle);
      return particleData;
    });

    const render = (time) => {
      particles.forEach((particle) => {
        const drift = time * particle.speed;
        const x = (particle.x + drift * 140) % 1240 - 20;
        const y = particle.y + Math.sin(drift + particle.phase) * particle.drift;
        particle.element.setAttribute("cx", `${x}`);
        particle.element.setAttribute("cy", `${y}`);
      });
    };

    let animationFrame;
    const animate = (time) => {
      render(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    render(0);
    if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
    reducedMotion.addEventListener?.("change", (event) => {
      window.cancelAnimationFrame(animationFrame);
      if (event.matches) render(0);
      else animationFrame = window.requestAnimationFrame(animate);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseAmbientRibbons, { once: true });
  } else {
    initialiseAmbientRibbons();
  }
})();

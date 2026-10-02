(() => {
  const initialiseMutedAutoplayVideo = (container) => {
    const iframe = container.querySelector("iframe");
    const toggle = container.querySelector(".project-video-sound-toggle");
    if (!iframe || !toggle) return;

    const sendToPlayer = (method, value) => {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage({ method, value }, "https://player.vimeo.com");
    };

    const setMuted = (muted) => {
      sendToPlayer("setMuted", muted);
      if (!muted) sendToPlayer("setVolume", 1);
      sendToPlayer("play");

      container.dataset.muted = String(muted);
      toggle.setAttribute("aria-pressed", String(!muted));
      toggle.setAttribute("aria-label", muted ? "Turn video sound on" : "Turn video sound off");
    };

    iframe.addEventListener("load", () => setMuted(true), { once: true });
    toggle.addEventListener("click", () => setMuted(container.dataset.muted !== "false"));
    setMuted(true);
  };

  const initialise = () => {
    document
      .querySelectorAll(".project-video-container[data-autoplay-muted]")
      .forEach(initialiseMutedAutoplayVideo);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();

(() => {
  const createSoundToggle = () => {
    const toggle = document.createElement("button");
    toggle.className = "project-video-sound-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Turn video sound on");
    toggle.setAttribute("aria-pressed", "false");
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"></path>
        <path class="project-video-sound-slash" d="m17 9 4 6m0-6-4 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
      </svg>`;
    return toggle;
  };

  const configureEmbed = (iframe) => {
    const url = new URL(iframe.src);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("muted", "1");
    url.searchParams.set("loop", "1");
    url.searchParams.set("controls", "0");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("dnt", "1");
    url.searchParams.set("api", "1");
    url.searchParams.set("background", "1");

    if (iframe.src !== url.href) iframe.src = url.href;
    const permissions = iframe.getAttribute("allow") || "";
    if (!permissions.includes("autoplay")) {
      iframe.setAttribute("allow", `${permissions}; autoplay`);
    }
  };

  const initialiseMutedAutoplayVideo = (iframe) => {
    const container = iframe.closest(".project-video-container, .vimeo-gif-wrapper");
    if (!container || container.dataset.videoControlsReady === "true") return;

    container.dataset.videoControlsReady = "true";
    container.dataset.autoplayMuted = "";
    if (document.body.classList.contains("project-4-tripleos")) {
      container.dataset.videoToggleTheme = "neon";
    }

    const hideToggle = container.dataset.hideVideoToggle === "true";
    const toggle = hideToggle
      ? null
      : container.querySelector(".project-video-sound-toggle") || createSoundToggle();
    if (toggle && !toggle.parentElement) container.appendChild(toggle);

    const sendToPlayer = (method, value) => {
      if (!iframe.contentWindow) return;
      // Vimeo's iframe API expects a JSON message, rather than a JavaScript object.
      iframe.contentWindow.postMessage(
        JSON.stringify({ method, value }),
        "https://player.vimeo.com"
      );
    };

    const setMuted = (muted) => {
      sendToPlayer("setMuted", muted);
      if (!muted) sendToPlayer("setVolume", 1);
      sendToPlayer("play");

      container.dataset.muted = String(muted);
      if (toggle) {
        toggle.setAttribute("aria-pressed", String(!muted));
        toggle.setAttribute("aria-label", muted ? "Turn video sound on" : "Turn video sound off");
      }
    };

    iframe.addEventListener("load", () => setMuted(true));
    if (toggle) {
      toggle.addEventListener("click", () => {
        setMuted(container.dataset.muted === "false");
      });
    }

    configureEmbed(iframe);
    setMuted(true);
  };

  const initialise = () => {
    document
      .querySelectorAll(".project-page iframe[src*='player.vimeo.com']")
      .forEach(initialiseMutedAutoplayVideo);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();

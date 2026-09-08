(() => {
  "use strict";

  const MUSIC_SOURCE = "./assets/music/synth-music.mp3";
  const SWAP_SOURCE = "./assets/music/swap-noise.mp3";
  const STATE_KEY = "brendan-hurt-audio-state";
  const MUSIC_VOLUME = 0.14;
  const FADE_DURATION = 850;
  const tracks = [new Audio(MUSIC_SOURCE), new Audio(MUSIC_SOURCE)];
  const swapSound = new Audio(SWAP_SOURCE);
  let activeTrack = 0;
  let hasStarted = false;
  let isCrossfading = false;
  let fadeFrame = null;
  let soundEnabled = false;

  tracks.forEach((track) => {
    track.preload = "auto";
    track.volume = 0;
  });
  swapSound.preload = "auto";

  const safeReadState = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STATE_KEY) || "null");
    } catch {
      return null;
    }
  };

  const saveState = () => {
    if (!hasStarted) return;
    const track = tracks[activeTrack];
    try {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({ playing: true, time: track.currentTime || 0 })
      );
    } catch {
      // Audio can still work when browser storage is unavailable.
    }
  };

  const fade = (fromTrack, toTrack, done) => {
    const startedAt = performance.now();
    const update = (now) => {
      const progress = Math.min((now - startedAt) / FADE_DURATION, 1);
      const eased = progress * progress * (3 - 2 * progress);
      if (fromTrack) fromTrack.volume = MUSIC_VOLUME * (1 - eased);
      if (toTrack) toTrack.volume = MUSIC_VOLUME * eased;
      if (progress < 1) {
        fadeFrame = requestAnimationFrame(update);
      } else {
        if (fromTrack) fromTrack.volume = 0;
        if (toTrack) toTrack.volume = MUSIC_VOLUME;
        fadeFrame = null;
        done?.();
      }
    };
    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    fadeFrame = requestAnimationFrame(update);
  };

  const startMusic = (time = 0) => {
    const track = tracks[activeTrack];
    if (Number.isFinite(time) && time > 0) {
      const setTime = () => {
        track.currentTime = track.duration
          ? Math.min(time, Math.max(track.duration - 0.1, 0))
          : time;
      };
      if (track.readyState >= 1) setTime();
      else track.addEventListener("loadedmetadata", setTime, { once: true });
    }

    let playAttempt;
    try {
      playAttempt = track.play();
    } catch {
      return Promise.resolve(false);
    }
    if (!playAttempt || typeof playAttempt.catch !== "function") return Promise.resolve(false);
    return playAttempt
      .then(() => {
        hasStarted = true;
        fade(null, track);
        saveState();
        return true;
      })
      .catch(() => {
        // The first interaction listener below will retry if autoplay is blocked.
        return false;
      });
  };

  const crossfadeLoop = () => {
    if (!hasStarted || isCrossfading) return;
    const outgoing = tracks[activeTrack];
    if (!Number.isFinite(outgoing.duration) || outgoing.duration - outgoing.currentTime > FADE_DURATION / 1000) {
      return;
    }

    const incomingIndex = activeTrack === 0 ? 1 : 0;
    const incoming = tracks[incomingIndex];
    isCrossfading = true;
    incoming.pause();
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.play().then(() => {
      fade(outgoing, incoming, () => {
        outgoing.pause();
        outgoing.currentTime = 0;
        activeTrack = incomingIndex;
        isCrossfading = false;
        saveState();
      });
    }).catch(() => {
      isCrossfading = false;
    });
  };

  const playSwap = () => {
    if (!soundEnabled) return;
    // Clone the warmed-up source so consecutive project swipes can overlap
    // cleanly without restarting an in-progress cue.
    const sound = swapSound.cloneNode(true);
    sound.currentTime = 0;
    sound.volume = 1;
    sound.play().catch(() => {});
  };

  const setSoundEnabled = (enabled) => {
    soundEnabled = enabled;

    if (soundEnabled) {
      startMusic(safeReadState()?.time || 0);
      return;
    }

    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
    tracks.forEach((track) => {
      track.pause();
      track.volume = 0;
    });
    hasStarted = false;
  };

  const initialiseSoundToggle = () => {
    const toggle = document.querySelector("#soundToggle");
    if (!toggle) return;

    const syncSoundControlSize = () => {
      const soundOrb = document.querySelector(".nav-sound-orb");
      const navButton = document.querySelector(".site-navigation .nav-branding-item");
      const height = navButton?.getBoundingClientRect().height;
      if (!soundOrb || !height) return;
      soundOrb.style.width = `${height}px`;
      soundOrb.style.height = `${height}px`;
    };

    const render = () => {
      toggle.checked = soundEnabled;
      toggle.setAttribute("aria-checked", String(soundEnabled));
      toggle.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
    };

    toggle.addEventListener("change", () => {
      setSoundEnabled(toggle.checked);
      render();
    });
    render();
    window.requestAnimationFrame(syncSoundControlSize);
    window.addEventListener("resize", () => window.requestAnimationFrame(syncSoundControlSize));
    if (document.fonts?.ready) document.fonts.ready.then(syncSoundControlSize);
  };

  const initialiseProjectNavigationSound = () => {
    document.querySelectorAll(".project-nav-control").forEach((control) => {
      control.addEventListener("mouseenter", playSwap);
    });
  };

  // Audio is always opt-in: playback begins only after the visitor enables it.
  soundEnabled = false;
  window.siteAudio = { playSwap, startMusic, saveState, setSoundEnabled };
  window.setInterval(crossfadeLoop, 150);
  window.setInterval(saveState, 1000);
  window.addEventListener("pagehide", saveState);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initialiseSoundToggle();
      initialiseProjectNavigationSound();
    }, { once: true });
  } else {
    initialiseSoundToggle();
    initialiseProjectNavigationSound();
  }
})();

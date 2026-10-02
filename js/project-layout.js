(() => {
  // Set to false to restore the legacy project-page structure without removing this file.
  const editorialProjectLayoutEnabled = true;
  if (!editorialProjectLayoutEnabled) return;

  const mediaSelector = "img, video, iframe";
  const descriptionSelector =
    ".project-description, .project-description-one-column, .animated-text-group";

  const hasMedia = (element) => Boolean(element.querySelector(mediaSelector));
  const hasDescription = (element) => Boolean(element.matches(descriptionSelector) || element.querySelector(descriptionSelector));
  const isEmptyLayoutElement = (element) => !hasMedia(element) && !hasDescription(element) && !element.textContent.trim();

  const promoteIntroMedia = (details) => {
    const firstMediaContainer = Array.from(details.children).find(hasMedia);
    if (!firstMediaContainer) return;

    // Miliano's deliberately begins with a complete two-image feature row.
    // Keep both figures together instead of promoting the first one as intro media.
    if (firstMediaContainer.classList.contains("project-milianos-menu-media-pair")) return;

    const firstFigure = firstMediaContainer.matches("figure.project-image")
      ? firstMediaContainer
      : firstMediaContainer.querySelector("figure.project-image");

    if (!firstFigure) {
      firstMediaContainer.classList.add("project-intro-media");
      return;
    }

    const introMedia = document.createElement("div");
    introMedia.className = "project-intro-media";
    firstMediaContainer.before(introMedia);
    introMedia.append(firstFigure);

    if (isEmptyLayoutElement(firstMediaContainer)) firstMediaContainer.remove();
  };

  const pairDescriptionsWithMedia = (details) => {
    let items = Array.from(details.children);

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item.isConnected || item.classList.contains("project-intro-media") || !hasDescription(item) || hasMedia(item)) continue;

      const copyItems = [item];
      let cursor = index + 1;

      while (cursor < items.length && hasDescription(items[cursor]) && !hasMedia(items[cursor])) {
        copyItems.push(items[cursor]);
        cursor += 1;
      }

      while (cursor < items.length && isEmptyLayoutElement(items[cursor])) {
        items[cursor].remove();
        cursor += 1;
      }

      const mediaItem = items[cursor];
      if (!mediaItem || !hasMedia(mediaItem)) continue;

      const row = document.createElement("section");
      row.className = "project-content-row";
      const copy = document.createElement("div");
      copy.className = "project-content-copy";

      item.before(row);
      copyItems.forEach((copyItem) => copy.append(copyItem));
      row.append(copy, mediaItem);
      items = Array.from(details.children);
      index = items.indexOf(row);
    }
  };

  // A two-image row gets columns proportional to each asset's aspect ratio.
  // Equal rendered heights follow naturally, while wide images receive more width.
  const equaliseImagePairHeights = (details) => {
    details.querySelectorAll(".project-image-container").forEach((container) => {
      const items = Array.from(container.children);
      if (items.length !== 2) return;

      const images = items.map((item) => item.matches(".project-image") && item.querySelector(":scope > img"));
      if (images.some((image) => !image)) return;

      const updateColumns = () => {
        const aspects = images.map((image) => {
          const width = image.naturalWidth || Number(image.getAttribute("width"));
          const height = image.naturalHeight || Number(image.getAttribute("height"));
          return width > 0 && height > 0 ? width / height : 0;
        });

        if (aspects.some((aspect) => !aspect)) return;
        container.classList.add("project-image-container--equal-height-pair");
        container.style.setProperty(
          "--media-pair-columns",
          aspects.map((aspect) => `${aspect.toFixed(6)}fr`).join(" ")
        );
      };

      updateColumns();
      images.forEach((image) => {
        if (!image.complete) image.addEventListener("load", updateColumns, { once: true });
      });
    });
  };

  const initialiseEditorialProjectLayout = () => {
    document.querySelectorAll("body.project-page .project-wrapper").forEach((wrapper) => {
      const aside = wrapper.querySelector(":scope > .project-aside");
      const details = wrapper.querySelector(":scope > .project-details");
      if (!aside || !details || details.dataset.editorialLayout === "enhanced") return;

      wrapper.querySelectorAll(".scroll-progress").forEach((progress) => progress.remove());
      Array.from(details.children)
        .filter(isEmptyLayoutElement)
        .forEach((element) => element.remove());

      promoteIntroMedia(details);
      pairDescriptionsWithMedia(details);
      equaliseImagePairHeights(details);
      details.dataset.editorialLayout = "enhanced";
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseEditorialProjectLayout, { once: true });
  } else {
    initialiseEditorialProjectLayout();
  }
})();

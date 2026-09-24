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
      details.dataset.editorialLayout = "enhanced";
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseEditorialProjectLayout, { once: true });
  } else {
    initialiseEditorialProjectLayout();
  }
})();

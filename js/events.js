async function loadEvents(containerId, limit = null) {
  const container = document.getElementById(containerId);

  if (!container) return;

  try {
    const response = await fetch(
      "https://api.github.com/repos/Edieey/velnora/contents/content/events"
    );

    const files = await response.json();

    let events = [];

    for (const file of files) {
      if (file.name.endsWith(".md")) {

        const fileResponse = await fetch(file.download_url);
        const text = await fileResponse.text();

        const titleMatch = text.match(/title:\s(.+)/);
        const dateMatch = text.match(/date:\s(.+)/);
        const imageMatch = text.match(/image:\s(.+)/);

const gallery = [];

const lines = text.split("\n");

lines.forEach(line => {

  if (line.includes("gallery_image:")) {

    const imagePath = line
      .split("gallery_image:")[1]
      .replace(/"/g, "")
      .trim();

    gallery.push(imagePath);
  }

});

        const title = titleMatch ? titleMatch[1].trim() : "Event";
        const date = dateMatch ? dateMatch[1].trim() : "";
        const image = imageMatch ? imageMatch[1].trim() : "";

const gallery = galleryMatches.map(g => {
  return g[1]
    .replace(/"/g, "")
    .trim();
});

    if (image && image !== "undefined") {
  events.push({
    title,
    date,
    image,
    gallery
  });
}
      }
    }

    events.reverse();

    if (limit) {
      events = events.slice(0, limit);
    }

    container.innerHTML = events.map((event, index) => `
      <div class="event-card" onclick="openGallery(${index})">
        <img src="${event.image}" alt="${event.title}">
        <div class="event-info">
          <h3>${event.title}</h3>
          <p>${event.date}</p>
        </div>
      </div>
    `).join("");

    window.allEvents = events;

  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function openGallery(index) {

  const event = window.allEvents[index];

  let galleryHTML = event.gallery.map(img => `
    <img src="${img}" class="gallery-img">
  `).join("");

  const popup = document.createElement("div");

  popup.className = "gallery-popup";

  popup.innerHTML = `
    <div class="gallery-content">
      <span class="close-popup">&times;</span>

      <h2>${event.title}</h2>

      <div class="gallery-grid">
        ${galleryHTML}
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector(".close-popup").onclick = () => {
    popup.remove();
  };
}

loadEvents("eventsContainer");
loadEvents("homeEvents", 2);
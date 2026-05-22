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

        // TITLE
        const titleMatch = text.match(/title:\s*(.*)/);
        const title = titleMatch
          ? titleMatch[1].replace(/"/g, "").trim()
          : "Event";

        // DATE
        const dateMatch = text.match(/date:\s*(.*)/);
        const date = dateMatch
          ? dateMatch[1].replace(/"/g, "").trim()
          : "";

        // COVER IMAGE
        const imageMatch = text.match(/image:\s*(.*)/);
        const image = imageMatch
          ? imageMatch[1].replace(/"/g, "").trim()
          : "";

const gallery = [];

const galleryMatches = text.matchAll(
  /-\s*(\/images\/uploads\/.*\.(png|jpg|jpeg|webp))/g
);

for (const match of galleryMatches) {

  const img = match[1].trim();

  gallery.push(img);

}
        events.push({
          title,
          date,
          image,
          gallery
        });
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

let currentGallery = [];
let currentIndex = 0;

function openGallery(index) {

  const event = window.allEvents[index];

  currentGallery = event.gallery;
  currentIndex = 0;

  if (currentGallery.length === 0) {
    return;
  }

  const popup = document.createElement("div");

  popup.className = "gallery-popup";

  popup.innerHTML = `

    <div class="gallery-slider">

      <span class="close-popup">&times;</span>

      <button class="gallery-arrow left-arrow">
        ❮
      </button>

      <img
        src="${currentGallery[currentIndex]}"
        class="slider-image"
        id="sliderImage"
      >

      <button class="gallery-arrow right-arrow">
        ❯
      </button>

    </div>

  `;

  document.body.appendChild(popup);

  // CLOSE BUTTON
  popup.querySelector(".close-popup").onclick = () => {
    popup.remove();
  };

  // CLICK OUTSIDE CLOSE
  popup.onclick = (e) => {

    if (e.target.classList.contains("gallery-popup")) {
      popup.remove();
    }

  };

  // LEFT
  popup.querySelector(".left-arrow").onclick = () => {

    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = currentGallery.length - 1;
    }

    document.getElementById("sliderImage").src =
      currentGallery[currentIndex];

  };

  // RIGHT
  popup.querySelector(".right-arrow").onclick = () => {

    currentIndex++;

    if (currentIndex >= currentGallery.length) {
      currentIndex = 0;
    }

    document.getElementById("sliderImage").src =
      currentGallery[currentIndex];

  };

  // ESC CLOSE
  document.onkeydown = (e) => {

    if (e.key === "Escape") {
      popup.remove();
    }

  };
}

loadEvents("eventsContainer");
loadEvents("homeEvents", 2);
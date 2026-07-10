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
async function loadMemories() {

  const container =
    document.getElementById("memoriesContainer");

  if (!container) return;

  try {

    const response = await fetch(
      "https://api.github.com/repos/Edieey/velnora/contents/content/memories"
    );

    const files = await response.json();

    let memories = [];

    for (const file of files) {

      if (file.name.endsWith(".md")) {

        const fileResponse =
          await fetch(file.download_url);

        const text =
          await fileResponse.text();

        const titleMatch =
          text.match(/title:\s*(.*)/);

        const locationMatch =
          text.match(/location:\s*(.*)/);

        const dateMatch =
          text.match(/date:\s*(.*)/);

        const imageMatch =
          text.match(/image:\s*(.*)/);

        const title = titleMatch
          ? titleMatch[1].replace(/"/g, "").trim()
          : "Memory";

        const location = locationMatch
          ? locationMatch[1].replace(/"/g, "").trim()
          : "";

        const date = dateMatch
          ? dateMatch[1].replace(/"/g, "").trim()
          : "";

        const image = imageMatch
          ? imageMatch[1].replace(/"/g, "").trim()
          : "";

        const gallery = [];

        const galleryMatches = text.matchAll(
          /-\s*(\/images\/uploads\/.*\.(png|jpg|jpeg|webp))/g
        );

        for (const match of galleryMatches) {

          gallery.push(match[1].trim());

        }

        memories.push({
          title,
          location,
          date,
          image,
          gallery
        });
      }
    }

    memories.reverse();

    container.innerHTML = memories.map((memory, index) => `

      <div
        class="event-card"
        onclick="openMemoryGallery(${index})"
      >

        <img
          src="${memory.image}"
          alt="${memory.title}"
        >

        <div class="event-info">

          <h3>${memory.title}</h3>

          <p>${memory.location}</p>

          <span>${memory.date}</span>

        </div>

      </div>

    `).join("");

    window.allMemories = memories;

  } catch (error) {

    console.error(error);

  }
}
function openMemoryGallery(index) {

  const memory =
    window.allMemories[index];

  currentGallery = memory.gallery;

  currentIndex = 0;

  if (currentGallery.length === 0) {
    return;
  }

  const popup =
    document.createElement("div");

  popup.className = "gallery-popup";

  popup.innerHTML = `

    <div class="gallery-slider">

      <span class="close-popup">
        &times;
      </span>

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

  popup.querySelector(".close-popup").onclick = () => {
    popup.remove();
  };

  popup.onclick = (e) => {

    if (
      e.target.classList.contains("gallery-popup")
    ) {
      popup.remove();
    }

  };

  popup.querySelector(".left-arrow").onclick = () => {

    currentIndex--;

    if (currentIndex < 0) {
      currentIndex =
        currentGallery.length - 1;
    }

    document.getElementById("sliderImage").src =
      currentGallery[currentIndex];

  };

  popup.querySelector(".right-arrow").onclick = () => {

    currentIndex++;

    if (
      currentIndex >= currentGallery.length
    ) {
      currentIndex = 0;
    }

    document.getElementById("sliderImage").src =
      currentGallery[currentIndex];

  };
}
loadMemories();
async function loadGalleryPage() {

  const container =
    document.getElementById("galleryContainer");

  if (!container) return;

  try {

    const response = await fetch(
      "https://api.github.com/repos/Edieey/velnora/contents/content/gallery"
    );

    const files = await response.json();

    let galleryItems = [];

    for (const file of files) {

      if (file.name.endsWith(".md")) {

        const fileResponse =
          await fetch(file.download_url);

        const text =
          await fileResponse.text();

        const titleMatch =
          text.match(/title:\s*(.*)/);

        const imageMatch =
          text.match(/image:\s*(.*)/);

        const title = titleMatch
          ? titleMatch[1].replace(/"/g, "").trim()
          : "Gallery";

        const image = imageMatch
          ? imageMatch[1].replace(/"/g, "").trim()
          : "";

        galleryItems.push({
          title,
          image
        });

      }

    }

    galleryItems.reverse();

    container.innerHTML = galleryItems.map(item => `

      <div class="artist-card">

        <img
          src="${item.image}"
          alt="${item.title}"
        >

      </div>

    `).join("");

  } catch (error) {

    console.error(
      "Error loading gallery:",
      error
    );

  }

}

loadGalleryPage();
async function loadArtists() {

  const container = document.getElementById("artistsContainer");

  if (!container) return;

  try {

    const response = await fetch(
      "https://api.github.com/repos/Edieey/velnora/contents/content/artists"
    );

    const files = await response.json();

    let artists = [];

    for (const file of files) {

      if (file.name.endsWith(".md")) {

        const fileResponse = await fetch(file.download_url);

        const text = await fileResponse.text();

        const titleMatch = text.match(/title:\s*(.*)/);

        const genreMatch = text.match(/genre:\s*(.*)/);

        const imageMatch = text.match(/image:\s*(.*)/);

        const title = titleMatch
          ? titleMatch[1].replace(/"/g, "").trim()
          : "Artist";

        const genre = genreMatch
          ? genreMatch[1].replace(/"/g, "").trim()
          : "";

        const image = imageMatch
          ? imageMatch[1].replace(/"/g, "").trim()
          : "";

        artists.push({
          title,
          genre,
          image
        });

      }

    }

    artists.reverse();

    container.innerHTML = artists.map(artist => `

      <div class="artist-card">

        <img src="${artist.image}" alt="${artist.title}">

        <h3>${artist.title}</h3>

        <p>${artist.genre}</p>

      </div>

    `).join("");

  } catch (error) {

    console.error("Error loading artists:", error);

  }

}

loadArtists();
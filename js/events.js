const EVENT_CACHE_KEY = "velnora-events-cache-v1";
const EVENT_CACHE_TIME = "velnora-events-cache-time";

let allEvents = [];
let currentGallery = [];
let currentIndex = 0;

async function loadEvents(containerId, limit = null) {

    const container = document.getElementById(containerId);

    if (!container) return;
    const cachedEvents = localStorage.getItem(EVENT_CACHE_KEY);
const cacheTime = localStorage.getItem(EVENT_CACHE_TIME);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cacheValid =
    cachedEvents &&
    cacheTime &&
    (Date.now() - Number(cacheTime) < CACHE_DURATION);

if (cacheValid) {

    const parsedEvents = JSON.parse(cachedEvents);

    let displayEvents = parsedEvents;

    if (limit) {
        displayEvents = parsedEvents.slice(0, limit);
    }

    container.innerHTML = displayEvents.map((event, index) => `

        <div class="event-card fade-in" onclick="openEvent(${index})">

            <img
                src="${event.image}"
                alt="${event.title}"
                loading="lazy"
                decoding="async">

            <div class="event-info">
                <h3>${event.title}</h3>
                <p>${event.date}</p>
            </div>

        </div>

    `).join("");

    allEvents = parsedEvents;

}

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/events"
        );

        const files = await response.json();

        let events = [];

const eventPromises = files
    .filter(file => file.name.endsWith(".md"))
    .map(async (file) => {

const fileResponse = await fetch(file.download_url);
const text = await fileResponse.text();

const slug = file.name.replace(".md", "");

const title =
    text.match(/title:\s*(.*)/)?.[1]
    ?.replace(/"/g, "")
    ?.trim() || "Event";

const date =
    text.match(/date:\s*(.*)/)?.[1]
    ?.replace(/"/g, "")
    ?.trim() || "";

const image =
    text.match(/image:\s*(.*)/)?.[1]
    ?.replace(/"/g, "")
    ?.trim() || "";

        const gallery = [];

        const galleryMatches = text.matchAll(
            /-\s*(\/images\/uploads\/.*\.(png|jpg|jpeg|webp))/g
        );

        for (const match of galleryMatches) {
            gallery.push(match[1].trim());
        }

return {
    slug,
    title,
    date,
    image,
    gallery
};

    });

events = await Promise.all(eventPromises);

events.reverse();

const allFetchedEvents = [...events];

let displayEvents = events;

if (limit) {
    displayEvents = events.slice(0, limit);
}

container.innerHTML = displayEvents.map((event, index) => `

<div class="event-card fade-in" onclick="openEvent(${index})">

    <img
        src="${event.image}"
        alt="${event.title}"
        loading="lazy"
        decoding="async"
        fetchpriority="low">

    <div class="event-info">

        <h3>${event.title}</h3>

        <p>${event.date}</p>

    </div>

</div>

`).join("");

allEvents = displayEvents;

localStorage.setItem(
    EVENT_CACHE_KEY,
    JSON.stringify(allFetchedEvents)
);

localStorage.setItem(
    EVENT_CACHE_TIME,
    Date.now()
);

localStorage.setItem(
    EVENT_CACHE_TIME,
    Date.now()
);

    }

    catch (error) {

        console.error("Events Error:", error);

    }

}

function openGallery(index) {

    currentGallery = allEvents[index].gallery;
    currentIndex = 0;

    if (!currentGallery.length) return;

    const popup = document.createElement("div");

    popup.className = "gallery-popup";

    popup.innerHTML = `

        <div class="gallery-slider">

            <span class="close-popup">&times;</span>

            <button class="gallery-arrow left-arrow">❮</button>

            <img
                id="sliderImage"
                class="slider-image"
                src="${currentGallery[currentIndex]}"
            >

            <button class="gallery-arrow right-arrow">❯</button>

        </div>

    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-popup").onclick = () => popup.remove();

    popup.onclick = (e) => {

        if (e.target.classList.contains("gallery-popup")) {
            popup.remove();
        }

    };

    popup.querySelector(".left-arrow").onclick = () => {

        currentIndex--;

        if (currentIndex < 0)
            currentIndex = currentGallery.length - 1;

        document.getElementById("sliderImage").src =
            currentGallery[currentIndex];

    };

    popup.querySelector(".right-arrow").onclick = () => {

        currentIndex++;

        if (currentIndex >= currentGallery.length)
            currentIndex = 0;

        document.getElementById("sliderImage").src =
            currentGallery[currentIndex];

    };

    document.onkeydown = (e) => {

        if (e.key === "Escape") {
            popup.remove();
        }

    };

}

if (document.getElementById("eventsContainer")) {
    loadEvents("eventsContainer");
}

if (document.getElementById("homeEventsContainer")) {
    loadEvents("homeEventsContainer", 2);
}
function openEvent(index) {

    const event = allEvents[index];

    if (!event) return;

    window.location.href =
        `eventsnew.html?slug=${event.slug}`;

}
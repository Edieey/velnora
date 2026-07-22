const MEMORIES_CACHE_KEY = "velnora-memories-cache-v1";
const MEMORIES_CACHE_TIME = "velnora-memories-cache-time";
const CACHE_DURATION = 5 * 60 * 1000;

let allMemories = [];
let memoryGallery = [];
let memoryIndex = 0;

async function loadMemories() {

    const container = document.getElementById("memoriesContainer");

    if (!container) return;
    const cachedMemories = localStorage.getItem(MEMORIES_CACHE_KEY);
const cacheTime = localStorage.getItem(MEMORIES_CACHE_TIME);

const cacheValid =
    cachedMemories &&
    cacheTime &&
    (Date.now() - Number(cacheTime) < CACHE_DURATION);

if (cacheValid) {

    const memories = JSON.parse(cachedMemories);

    container.innerHTML = memories.map((memory, index) => `

        <div class="event-card fade-in" onclick="openMemoryGallery(${index})">

            <img
                src="${memory.image}"
                alt="${memory.title}"
                loading="lazy"
                decoding="async"
                fetchpriority="low">

            <div class="event-info">

                <h3>${memory.title}</h3>

                <p>${memory.location}</p>

                <span>${memory.date}</span>

            </div>

        </div>

    `).join("");

    allMemories = memories;

}

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/memories"
        );

        const files = await response.json();

        let memories = [];

const memoryPromises = files
    .filter(file => file.name.endsWith(".md"))
    .map(async (file) => {

        const fileResponse = await fetch(file.download_url);

        const text = await fileResponse.text();

        const title =
            text.match(/title:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim() || "Memory";

        const location =
            text.match(/location:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim() || "";

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
            title,
            location,
            date,
            image,
            gallery
        };

    });

memories = await Promise.all(memoryPromises);

        memories.reverse();
        localStorage.setItem(
    MEMORIES_CACHE_KEY,
    JSON.stringify(memories)
);

localStorage.setItem(
    MEMORIES_CACHE_TIME,
    Date.now()
);

        container.innerHTML = memories.map((memory, index) => `

            <div class="event-card" onclick="openMemoryGallery(${index})">

                <img
    src="${memory.image}"
    alt="${memory.title}"
    loading="lazy"
    decoding="async"
    fetchpriority="low">

                <div class="event-info">

                    <h3>${memory.title}</h3>

                    <p>${memory.location}</p>

                    <span>${memory.date}</span>

                </div>

            </div>

        `).join("");

        allMemories = memories;

    }

    catch (error) {

        console.error("Memories Error:", error);

    }

}

function openMemoryGallery(index) {

    memoryGallery = allMemories[index].gallery;

    memoryIndex = 0;

    if (!memoryGallery.length) return;

    const popup = document.createElement("div");

    popup.className = "gallery-popup";

    popup.innerHTML = `

        <div class="gallery-slider">

            <span class="close-popup">&times;</span>

            <button class="gallery-arrow left-arrow">❮</button>

            <img
                id="memorySliderImage"
                class="slider-image"
                src="${memoryGallery[memoryIndex]}"
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

        memoryIndex--;

        if (memoryIndex < 0)
            memoryIndex = memoryGallery.length - 1;

        document.getElementById("memorySliderImage").src =
            memoryGallery[memoryIndex];

    };

    popup.querySelector(".right-arrow").onclick = () => {

        memoryIndex++;

        if (memoryIndex >= memoryGallery.length)
            memoryIndex = 0;

        document.getElementById("memorySliderImage").src =
            memoryGallery[memoryIndex];

    };

    document.onkeydown = (e) => {

        if (e.key === "Escape") {
            popup.remove();
        }

    };

}

loadMemories();
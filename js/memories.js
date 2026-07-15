let allMemories = [];
let memoryGallery = [];
let memoryIndex = 0;

async function loadMemories() {

    const container = document.getElementById("memoriesContainer");

    if (!container) return;

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/memories"
        );

        const files = await response.json();

        let memories = [];

        for (const file of files) {

            if (!file.name.endsWith(".md")) continue;

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

            memories.push({
                title,
                location,
                date,
                image,
                gallery
            });

        }

        memories.reverse();

        container.innerHTML = memories.map((memory, index) => `

            <div class="event-card" onclick="openMemoryGallery(${index})">

                <img src="${memory.image}" alt="${memory.title}">

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
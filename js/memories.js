const MEMORIES_CACHE_KEY = "velnora-memories-cache-v1";
const MEMORIES_CACHE_TIME = "velnora-memories-cache-time";
const CACHE_DURATION = 5 * 60 * 1000;

let allMemories = [];
let memoryGallery = [];
let memoryIndex = 0;


/* ==========================================================
   LOAD MEMORIES
========================================================== */

async function loadMemories() {

    const container = document.getElementById("memoriesContainer");

    if (!container) return;


    /* ======================================================
       CHECK CACHE
    ====================================================== */

    const cachedMemories =
        localStorage.getItem(MEMORIES_CACHE_KEY);

    const cacheTime =
        localStorage.getItem(MEMORIES_CACHE_TIME);

    const cacheValid =
        cachedMemories &&
        cacheTime &&
        (Date.now() - Number(cacheTime) < CACHE_DURATION);


    if (cacheValid) {

        const memories = JSON.parse(cachedMemories);

        allMemories = memories;

        renderMemories(memories);

        return;
    }


    /* ======================================================
       LOAD FROM GITHUB
    ====================================================== */

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/memories"
        );


        if (!response.ok) {

            throw new Error(
                `GitHub request failed: ${response.status}`
            );

        }


        const files = await response.json();


        let memories = [];


        /* ==================================================
           READ EACH MEMORY MARKDOWN FILE
        ================================================== */

        const memoryPromises = files

            .filter(file =>
                file.name.endsWith(".md")
            )

            .map(async (file) => {

                const fileResponse =
                    await fetch(file.download_url);


                const text =
                    await fileResponse.text();


                /* ==========================================
                   BASIC INFORMATION
                ========================================== */

                const title =
                    text.match(/title:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "Memory";


                const location =
                    text.match(/location:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "";


                const date =
                    text.match(/date:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "";


                const image =
                    text.match(/image:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "";


                /* ==========================================
                   CLICK ACTION
                   
                   Old memories don't have this field.
                   Therefore default = gallery.
                ========================================== */

                const clickAction =
                    text.match(/click_action:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "gallery";


                /* ==========================================
                   EXTERNAL LINK
                ========================================== */

                const externalLink =
                    text.match(/external_link:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "";


                /* ==========================================
                   GALLERY
                ========================================== */

                const gallery = [];


                const galleryMatches = text.matchAll(
                    /-\s*(\/images\/uploads\/.*\.(png|jpg|jpeg|webp))/g
                );


                for (const match of galleryMatches) {

                    gallery.push(
                        match[1].trim()
                    );

                }


                /* ==========================================
                   RETURN MEMORY
                ========================================== */

                return {

                    title,

                    location,

                    date,

                    image,

                    clickAction,

                    externalLink,

                    gallery

                };

            });


        memories =
            await Promise.all(memoryPromises);


        /* ==================================================
           NEWEST FIRST
        ================================================== */

        memories.reverse();


        /* ==================================================
           SAVE CACHE
        ================================================== */

        localStorage.setItem(
            MEMORIES_CACHE_KEY,
            JSON.stringify(memories)
        );


        localStorage.setItem(
            MEMORIES_CACHE_TIME,
            Date.now()
        );


        allMemories = memories;


        /* ==================================================
           DISPLAY MEMORIES
        ================================================== */

        renderMemories(memories);


    } catch (error) {

        console.error(
            "Memories Error:",
            error
        );

    }

}


/* ==========================================================
   RENDER MEMORY CARDS
========================================================== */

function renderMemories(memories) {

    const container =
        document.getElementById("memoriesContainer");


    if (!container) return;


    container.innerHTML = memories.map(
        (memory, index) => `

        <div
            class="event-card fade-in"
            onclick="handleMemoryClick(${index})"
        >

            <img
                src="${memory.image}"
                alt="${memory.title}"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
            >

            <div class="event-info">

                <h3>
                    ${memory.title}
                </h3>

                <p>
                    ${memory.location}
                </p>

                <span>
                    ${memory.date}
                </span>

            </div>

        </div>

    `
    ).join("");

}


/* ==========================================================
   HANDLE MEMORY CARD CLICK
========================================================== */

function handleMemoryClick(index) {

    const memory =
        allMemories[index];


    if (!memory) return;


    /* ======================================================
       EXTERNAL LINK
    ====================================================== */

    if (
        memory.clickAction === "link" &&
        memory.externalLink
    ) {

        window.open(
            memory.externalLink,
            "_blank",
            "noopener,noreferrer"
        );

        return;
    }


    /* ======================================================
       GALLERY
       
       Default behavior for old memories.
    ====================================================== */

    openMemoryGallery(index);

}


/* ==========================================================
   OPEN MEMORY GALLERY
========================================================== */

function openMemoryGallery(index) {

    const memory =
        allMemories[index];


    if (!memory) return;


    memoryGallery =
        memory.gallery || [];


    memoryIndex = 0;


    /* ======================================================
       NO GALLERY
    ====================================================== */

    if (!memoryGallery.length) {

        console.warn(
            "This memory has no gallery images."
        );

        return;
    }


    /* ======================================================
       CREATE POPUP
    ====================================================== */

    const popup =
        document.createElement("div");


    popup.className =
        "gallery-popup";


    popup.innerHTML = `

        <div class="gallery-slider">

            <span class="close-popup">
                &times;
            </span>

            <button
                class="gallery-arrow left-arrow">
                ❮
            </button>

            <img
                id="memorySliderImage"
                class="slider-image"
                src="${memoryGallery[memoryIndex]}"
                alt="${memory.title}"
            >

            <button
                class="gallery-arrow right-arrow">
                ❯
            </button>

        </div>

    `;


    document.body.appendChild(popup);


    /* ======================================================
       CLOSE BUTTON
    ====================================================== */

    popup
        .querySelector(".close-popup")
        .onclick = () => {

            popup.remove();

            document.onkeydown = null;

        };


    /* ======================================================
       CLICK OUTSIDE IMAGE
    ====================================================== */

    popup.onclick = (e) => {

        if (
            e.target.classList.contains(
                "gallery-popup"
            )
        ) {

            popup.remove();

            document.onkeydown = null;

        }

    };


    /* ======================================================
       LEFT ARROW
    ====================================================== */

    popup
        .querySelector(".left-arrow")
        .onclick = () => {

            memoryIndex--;


            if (
                memoryIndex < 0
            ) {

                memoryIndex =
                    memoryGallery.length - 1;

            }


            document
                .getElementById(
                    "memorySliderImage"
                )
                .src =
                memoryGallery[memoryIndex];

        };


    /* ======================================================
       RIGHT ARROW
    ====================================================== */

    popup
        .querySelector(".right-arrow")
        .onclick = () => {

            memoryIndex++;


            if (
                memoryIndex >=
                memoryGallery.length
            ) {

                memoryIndex = 0;

            }


            document
                .getElementById(
                    "memorySliderImage"
                )
                .src =
                memoryGallery[memoryIndex];

        };


    /* ======================================================
       KEYBOARD CONTROLS
    ====================================================== */

    document.onkeydown = (e) => {

        if (
            e.key === "Escape"
        ) {

            popup.remove();

            document.onkeydown = null;

        }


        if (
            e.key === "ArrowLeft"
        ) {

            popup
                .querySelector(".left-arrow")
                .click();

        }


        if (
            e.key === "ArrowRight"
        ) {

            popup
                .querySelector(".right-arrow")
                .click();

        }

    };

}


/* ==========================================================
   START
========================================================== */

loadMemories();
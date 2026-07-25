const slug=new URLSearchParams(location.search).get('slug');console.log('Event slug:',slug);// ======================================================
// VELNORA EVENT PAGE
// PART 1
// ======================================================

let eventData = {};

async function loadEvent() {

    if (!slug) {
        showError("No event selected.");
        return;
    }

    try {

        const response = await fetch(
            `content/events/${slug}.md`
        );

        if (!response.ok) {
            throw new Error("Event not found");
        }

        const markdown = await response.text();

        eventData = parseMarkdown(markdown);

        populateBasicInfo();


    }

    catch (err) {

        console.error(err);

        showError("Unable to load event.");

    }

}


// ======================================================
// MARKDOWN PARSER
// ======================================================

function parseMarkdown(text) {

    const frontMatter =
        text.match(/---([\s\S]*?)---/);

    const body =
        text.replace(/---([\s\S]*?)---/, "").trim();

    const yaml = frontMatter ? frontMatter[1] : "";

    return {

        title:
            getValue(yaml, "title"),

        date:
            getValue(yaml, "date"),

        time:
            getValue(yaml, "time"),

        venue:
            getValue(yaml, "venue"),

        image:
            getValue(yaml, "image"),

        button_text:
            getValue(yaml, "button_text") || "GET TICKETS",

        ticket_url:
            getValue(yaml, "ticket_url"),

        hero_images:
            getList(yaml, "hero_images"),

        gallery:
            getList(yaml, "gallery"),

        lineup:
            getSimpleList(yaml, "lineup"),

        description:
            body

    };

}
// ======================================================
// SIMPLE MARKDOWN FORMATTER
// ======================================================

function formatMarkdown(text) {

    if (!text) return "";

    return text

        .replace(/^### (.*)$/gm, "<h3>$1</h3>")

        .replace(/^## (.*)$/gm, "<h2>$1</h2>")

        .replace(/^# (.*)$/gm, "<h1>$1</h1>")

        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        .replace(/\n\n/g, "</p><p>")

        .replace(/\n/g, "<br>")

        .replace(/^/, "<p>")

        .replace(/$/, "</p>");

}


// ======================================================
// GET SINGLE VALUE
// ======================================================

function getValue(yaml, key) {

    const match =
        yaml.match(
            new RegExp(`${key}:\\s*(.*)`)
        );

    if (!match) return "";

    return match[1]
        .replace(/"/g, "")
        .trim();

}


// ======================================================
// IMAGE LIST
// ======================================================

function getList(yaml, key) {

    const block =
        yaml.match(
            new RegExp(`${key}:([\\s\\S]*?)(\\n\\w|$)`)
        );

    if (!block) return [];

    return block[1]
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("-"))
        .map(line =>
            line
                .replace(/^-\s*/, "")
                .replace(/^hero_image:\s*/, "")
                .replace(/^gallery_image:\s*/, "")
                .replace(/"/g, "")
                .trim()
        )
        .filter(Boolean);

}


// ======================================================
// STRING LIST
// ======================================================

function getSimpleList(yaml, key) {

    const block =
        yaml.match(
            new RegExp(`${key}:([\\s\\S]*?)(\\n\\w|$)`)
        );

    if (!block) return [];

    return block[1]
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("-"))
        .map(line =>
            line
                .replace(/^-\s*/, "")
                .replace(/^artist:\s*/, "")
                .replace(/"/g, "")
                .trim()
        )
        .filter(Boolean);

}


// ======================================================
// BASIC INFO
// ======================================================

function populateBasicInfo() {

    document.getElementById("eventTitle").textContent =
        eventData.title;

    document.getElementById("eventDate").textContent =
        eventData.date;

    document.getElementById("eventVenue").textContent =
        eventData.venue;

document.getElementById("eventDescription").innerHTML =
    formatMarkdown(eventData.description);

    const ticketButton =
        document.getElementById("ticketButton");

    if (eventData.ticket_url) {

        ticketButton.href =
            eventData.ticket_url;

        ticketButton.textContent =
            eventData.button_text;

    } else {

        ticketButton.style.display = "none";

    }
    buildHeroSlider();
buildLineup();
buildGallery();


}

function showError(message) {

    document.getElementById("eventTitle").textContent =
        message;

}


// ======================================================

loadEvent();
// ======================================================
// HERO SLIDER
// ======================================================

let heroIndex = 0;
let heroInterval = null;

function buildHeroSlider() {
    heroIndex = 0;

    const slider = document.getElementById("heroSlider");

    slider.innerHTML = "";

    let images = [];
    console.log(eventData.hero_images);
console.log(eventData.image);

    if (eventData.hero_images && eventData.hero_images.length) {

        images = eventData.hero_images;

    } else if (eventData.image) {

        images = [eventData.image];

    }

    if (!images.length) return;

    images.forEach((src, index) => {

        const slide = document.createElement("div");

        slide.className = "hero-slide";

        if (index === 0)
            slide.classList.add("active");

        const img = new Image();

img.src = src;

slide.style.backgroundImage = `url(${src})`;

img.onload = () => {

    slide.classList.add("loaded");

};

        slider.appendChild(slide);

    });

    startHeroSlider(images.length);

}


// ======================================================
// AUTO HERO SLIDER
// ======================================================

function startHeroSlider(total) {

    if (total <= 1) return;

    clearInterval(heroInterval);

    heroInterval = setInterval(() => {

        const slides =
            document.querySelectorAll(".hero-slide");

        slides[heroIndex].classList.remove("active");

        heroIndex++;

        if (heroIndex >= total)
            heroIndex = 0;

        slides[heroIndex].classList.add("active");

    }, 5000);

}


// ======================================================
// BUILD LINEUP
// ======================================================

function buildLineup() {

    const grid =
        document.getElementById("lineupGrid");

    if (!eventData.lineup.length) {

        grid.parentElement.style.display = "none";

        return;

    }

grid.innerHTML =
    eventData.lineup
        .filter(artist => artist.trim() !== "")
        .map(artist => `

            <div class="lineup-card">

                <h3>${artist}</h3>

            </div>

        `).join("");

}


// ======================================================
// BUILD GALLERY
// ======================================================

function buildGallery() {

    const grid =
        document.getElementById("galleryGrid");

    if (!eventData.gallery.length) {

        grid.parentElement.style.display = "none";

        return;

    }

    grid.innerHTML =
        eventData.gallery.map((image, index) => `

<img
    src="${image}"
    alt="Gallery Image"
    decoding="async"
    loading="lazy"
                class="gallery-image"
                loading="lazy"
                onclick="openLightbox(${index})"
            >

        `).join("");

}


// ======================================================
// LIGHTBOX
// ======================================================

let lightboxIndex = 0;

function openLightbox(index) {

    lightboxIndex = index;

    const popup =
        document.createElement("div");

    popup.className = "gallery-popup";

    popup.innerHTML = `

        <div class="gallery-slider">

            <span class="close-popup">&times;</span>

            <button class="gallery-arrow left-arrow">❮</button>

            <img
                id="sliderImage"
                class="slider-image"
                src="${eventData.gallery[lightboxIndex]}"
            >

            <button class="gallery-arrow right-arrow">❯</button>

        </div>

    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-popup").onclick =
        () => popup.remove();

    popup.onclick = e => {

        if (e.target.classList.contains("gallery-popup"))
            popup.remove();

    };

    popup.querySelector(".left-arrow").onclick =
        previousImage;

    popup.querySelector(".right-arrow").onclick =
        nextImage;

    document.onkeydown = e => {

        if (e.key === "ArrowLeft")
            previousImage();

        if (e.key === "ArrowRight")
            nextImage();

        if (e.key === "Escape")
            popup.remove();

    };

}


// ======================================================
// PREVIOUS IMAGE
// ======================================================

function previousImage() {

    lightboxIndex--;

    if (lightboxIndex < 0)
        lightboxIndex =
            eventData.gallery.length - 1;

    document.getElementById("sliderImage").src =
        eventData.gallery[lightboxIndex];

}


// ======================================================
// NEXT IMAGE
// ======================================================

function nextImage() {

    lightboxIndex++;

    if (lightboxIndex >= eventData.gallery.length)
        lightboxIndex = 0;

    document.getElementById("sliderImage").src =
        eventData.gallery[lightboxIndex];

}


// ======================================================
// INITIALIZE PAGE
// ======================================================

// Keep your existing loadEvent() function.
// Update the end of populateBasicInfo() by adding these lines:

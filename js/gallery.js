const GALLERY_CACHE_KEY = "velnora-gallery-cache-v1";
const GALLERY_CACHE_TIME = "velnora-gallery-cache-time";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
async function loadGalleryPage() {

    const container = document.getElementById("galleryContainer");

    if (!container) return;
    const cachedGallery = localStorage.getItem(GALLERY_CACHE_KEY);
const cacheTime = localStorage.getItem(GALLERY_CACHE_TIME);

const cacheValid =
    cachedGallery &&
    cacheTime &&
    (Date.now() - Number(cacheTime) < CACHE_DURATION);

if (cacheValid) {

    const galleryItems = JSON.parse(cachedGallery);

    container.innerHTML = galleryItems.map(item => `

        <div class="artist-card fade-in">

            <img
                src="${item.image}"
                alt="${item.title}"
                loading="lazy"
                decoding="async"
                fetchpriority="low">

        </div>

    `).join("");

}

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/gallery"
        );

        const files = await response.json();

        let galleryItems = [];

const galleryPromises = files
    .filter(file => file.name.endsWith(".md"))
    .map(async (file) => {

        const fileResponse = await fetch(file.download_url);
        const text = await fileResponse.text();

        const title =
            text.match(/title:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim() || "Gallery";

        const image =
            text.match(/image:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim() || "";

        return {
            title,
            image
        };

    });

galleryItems = await Promise.all(galleryPromises);

        galleryItems.reverse();
        localStorage.setItem(
    GALLERY_CACHE_KEY,
    JSON.stringify(galleryItems)
);

localStorage.setItem(
    GALLERY_CACHE_TIME,
    Date.now()
);

        container.innerHTML = galleryItems.map(item => `

            <div class="artist-card">

                <img
    src="${item.image}"
    alt="${item.title}"
    loading="lazy"
    decoding="async"
    fetchpriority="low">

            </div>

        `).join("");

    }

    catch (error) {

        console.error("Gallery Error:", error);

    }

}

loadGalleryPage();
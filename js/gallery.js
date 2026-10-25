const GALLERY_CACHE_KEY = "velnora-gallery-cache-v2";
const GALLERY_CACHE_TIME = "velnora-gallery-cache-time-v2";
const CACHE_DURATION = 5 * 60 * 1000;

let galleryAlbums = [];
let activeGalleryImages = [];
let activeGalleryIndex = 0;

const GALLERY_API =
    "https://api.github.com/repos/Edieey/velnora/contents/content/gallery";


async function loadGalleryPage() {
    const container = document.getElementById("galleryContainer");
    if (!container) return;

    try {
        const response = await fetch(GALLERY_API);

        if (!response.ok) {
            throw new Error(`Unable to load albums: ${response.status}`);
        }

        const files = await response.json();

        if (!Array.isArray(files)) {
            throw new Error("Gallery folder could not be loaded.");
        }

        const markdownFiles = files.filter(file =>
            file.name.toLowerCase().endsWith(".md")
        );

        const albums = await Promise.all(
            markdownFiles.map(async file => {
                const fileResponse = await fetch(file.download_url);

                if (!fileResponse.ok) {
                    throw new Error(`Unable to load ${file.name}`);
                }

                const text = await fileResponse.text();
                const frontMatterMatch = text.match(/^---\s*([\s\S]*?)\s*---/);
                const frontMatter = frontMatterMatch
                    ? frontMatterMatch[1]
                    : text;

                const getField = name => {
                    const regex = new RegExp(
                        `^${name}:\\s*(.*)$`,
                        "m"
                    );

                    return frontMatter.match(regex)?.[1]
                        ?.trim()
                        .replace(/^["']|["']$/g, "") || "";
                };

                const title = getField("title") || "Gallery";
                const coverImage = getField("image");
                const date = getField("date");

                const images = [];
const imageBlock = frontMatter.match(
    /^images:[ \t]*\r?\n((?:[ \t]+-[ \t]*.*(?:\r?\n|$))*)/m
);

                if (imageBlock) {
const matches = imageBlock[1].matchAll(
    /^[ \t]*-[ \t]*(.+?)[ \t]*$/gm
);

                    for (const match of matches) {
                        const image = match[1]
                            .trim()
                            .replace(/^["']|["']$/g, "");

                        if (image && !images.includes(image)) {
                            images.push(image);
                        }
                    }
                }

                // Support older albums that use a single "image" field.
                if (coverImage && !images.includes(coverImage)) {
                    // Keep the cover separate from the album photos.
                }

                const allImages = [...images];

                // If an album has no separate gallery images, use its cover.
                if (!allImages.length && coverImage) {
                    allImages.push(coverImage);
                }

                return {
                    title,
                    date,
                    coverImage: coverImage || allImages[0] || "",
                    images: allImages,
                    slug: file.name.replace(/\.md$/i, "")
                };
            })
        );

        // Sort by date, newest first, when dates are available.
        albums.sort((a, b) => {
            const dateA = parseGalleryDate(a.date);
            const dateB = parseGalleryDate(b.date);

            if (dateA && dateB) return dateB - dateA;
            if (dateA) return -1;
            if (dateB) return 1;

            return 0;
        });

        galleryAlbums = albums;

        localStorage.setItem(
            GALLERY_CACHE_KEY,
            JSON.stringify(albums)
        );

        localStorage.setItem(
            GALLERY_CACHE_TIME,
            String(Date.now())
        );

        renderGalleryAlbums(container, albums);

    } catch (error) {
        console.error("Gallery Error:", error);
        container.innerHTML =
            '<p class="gallery-error">Unable to load the gallery. Please try again later.</p>';
    }
}


function parseGalleryDate(value) {
    if (!value) return null;

    // Supports DD.MM.YYYY, DD-MM-YYYY and DD/MM/YYYY.
    const match = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (match) {
        const [, day, month, year] = match;
        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}


function renderGalleryAlbums(container, albums) {
    if (!albums.length) {
        container.innerHTML = "<p>No gallery albums available yet.</p>";
        return;
    }

    container.innerHTML = albums.map((album, index) => {
        const title = escapeGalleryText(album.title);
        const cover = escapeGalleryAttribute(album.coverImage);

        return `
            <article class="artist-card gallery-album-card">
                <button
                    type="button"
                    class="gallery-album-button"
                    onclick="openGalleryAlbum(${index})"
                    aria-label="Open ${title} album">

                    <img
                        class="gallery-album-cover"
                        src="${cover}"
                        alt="${title}"
                        loading="lazy"
                        decoding="async">

                    <div class="gallery-album-info">
                        <h3>${title}</h3>
                    </div>
                </button>
            </article>
        `;
    }).join("");
}


function openGalleryAlbum(index) {
    const album = galleryAlbums[index];
    if (!album) return;

    activeGalleryImages = Array.isArray(album.images)
        ? album.images.filter(Boolean)
        : [];

    if (!activeGalleryImages.length && album.coverImage) {
        activeGalleryImages = [album.coverImage];
    }

    if (!activeGalleryImages.length) {
        console.warn("This album has no images.");
        return;
    }

    activeGalleryIndex = 0;

    // Remember the album card and page position.
    const albumCards = document.querySelectorAll(".gallery-album-card");
    const albumCard = albumCards[index];
    const previousScrollY = window.scrollY;

    // Create the scrollable album overlay only once.
    let albumView = document.getElementById("galleryAlbumView");

    if (!albumView) {
        albumView = document.createElement("div");
        albumView.id = "galleryAlbumView";
        albumView.className = "gallery-album-view";

        albumView.innerHTML = `
            <button type="button"
                class="gallery-album-view-close"
                aria-label="Back to gallery">&times;</button>

            <h2 class="gallery-album-view-title"></h2>

            <div class="gallery-album-photos"></div>
        `;

        document.body.appendChild(albumView);

        albumView.querySelector(".gallery-album-view-close")
            .addEventListener("click", closeGalleryAlbum);
    }

    albumView.dataset.albumIndex = index;
    albumView.dataset.previousScrollY = previousScrollY;
    albumView.dataset.cardTop = albumCard
        ? albumCard.getBoundingClientRect().top + window.scrollY
        : previousScrollY;

    albumView.querySelector(".gallery-album-view-title").textContent =
        album.title;

    const photosContainer =
        albumView.querySelector(".gallery-album-photos");

    photosContainer.innerHTML = activeGalleryImages.map((image, imageIndex) => `
        <button type="button"
            class="gallery-album-photo-button"
            data-image-index="${imageIndex}"
            aria-label="Open photo ${imageIndex + 1}">

            <img
                class="gallery-album-photo"
                src="${escapeGalleryAttribute(image)}"
                alt="${escapeGalleryText(album.title)} — ${imageIndex + 1}"
                loading="${imageIndex < 3 ? "eager" : "lazy"}"
                decoding="async">
        </button>
    `).join("");

    photosContainer.querySelectorAll(".gallery-album-photo-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                const imageIndex = Number(button.dataset.imageIndex);
                openGalleryPhotoViewer(album, imageIndex);
            });
        });

    document.body.style.overflow = "hidden";
    albumView.classList.add("active");
    albumView.scrollTop = 0;
}


function openGalleryPhotoViewer(album, imageIndex) {
    activeGalleryIndex = imageIndex;

    let lightbox = document.getElementById("galleryLightbox");

    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.id = "galleryLightbox";
        lightbox.className = "gallery-lightbox";

        lightbox.innerHTML = `
            <button type="button" class="gallery-lightbox-close"
                aria-label="Close photo viewer">&times;</button>

            <button type="button" class="gallery-lightbox-arrow previous"
                aria-label="Previous photo">&#10094;</button>

            <img class="gallery-lightbox-image" src="" alt="">

            <button type="button" class="gallery-lightbox-arrow next"
                aria-label="Next photo">&#10095;</button>

            <p class="gallery-lightbox-caption"></p>
        `;

        document.body.appendChild(lightbox);

        lightbox.querySelector(".gallery-lightbox-close")
            .addEventListener("click", closeGalleryPhotoViewer);

        lightbox.querySelector(".previous")
            .addEventListener("click", () => changeGalleryImage(-1));

        lightbox.querySelector(".next")
            .addEventListener("click", () => changeGalleryImage(1));

        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) closeGalleryPhotoViewer();
        });

        let touchStartX = 0;
        let touchStartY = 0;

        lightbox.addEventListener("touchstart", event => {
            touchStartX = event.changedTouches[0].clientX;
            touchStartY = event.changedTouches[0].clientY;
        }, { passive: true });

        lightbox.addEventListener("touchend", event => {
            const dx = event.changedTouches[0].clientX - touchStartX;
            const dy = event.changedTouches[0].clientY - touchStartY;

            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                changeGalleryImage(dx < 0 ? 1 : -1);
            }
        }, { passive: true });
    }

    lightbox.dataset.title = album.title;
    lightbox.classList.add("active");
    updateGalleryLightbox();

    // Escape closes the photo viewer first.
    document.addEventListener("keydown", handleGalleryEscape);
}


function closeGalleryPhotoViewer() {
    const lightbox = document.getElementById("galleryLightbox");

    if (lightbox) {
        lightbox.classList.remove("active");
    }

    document.removeEventListener("keydown", handleGalleryEscape);
}


function handleGalleryEscape(event) {
    if (event.key === "Escape") {
        closeGalleryPhotoViewer();
    }
}

function updateGalleryLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (!lightbox) return;

    const image = activeGalleryImages[activeGalleryIndex];
    const album = galleryAlbums.find(item =>
        item.title === lightbox.dataset.title
    );

    if (!image) return;

    lightbox.querySelector(".gallery-lightbox-image").src = image;
    lightbox.querySelector(".gallery-lightbox-image").alt =
        album?.title || "Gallery image";

    lightbox.querySelector(".gallery-lightbox-caption").textContent =
        `${album?.title || "Gallery"} — ${activeGalleryIndex + 1} / ${activeGalleryImages.length}`;

    const multiple = activeGalleryImages.length > 1;
    lightbox.querySelector(".previous").hidden = !multiple;
    lightbox.querySelector(".next").hidden = !multiple;
}


function changeGalleryImage(direction) {
    if (!activeGalleryImages.length) return;

    activeGalleryIndex =
        (activeGalleryIndex + direction + activeGalleryImages.length)
        % activeGalleryImages.length;

    updateGalleryLightbox();
}


function closeGalleryAlbum() {
    const albumView = document.getElementById("galleryAlbumView");

    if (!albumView) return;

    const previousScrollY = Number(albumView.dataset.previousScrollY || 0);
    const cardTop = Number(albumView.dataset.cardTop || previousScrollY);

    albumView.classList.remove("active");

    const lightbox = document.getElementById("galleryLightbox");

    if (lightbox) {
        lightbox.classList.remove("active");
    }

    document.removeEventListener("keydown", handleGalleryEscape);

    document.body.style.overflow = "";

    requestAnimationFrame(() => {
        window.scrollTo(0, cardTop || previousScrollY);
    });
}


function escapeGalleryText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


function escapeGalleryAttribute(value) {
    return escapeGalleryText(value);
}


document.addEventListener("keydown", event => {
    const lightbox = document.getElementById("galleryLightbox");
    const albumView = document.getElementById("galleryAlbumView");

    if (lightbox?.classList.contains("active")) {
        if (event.key === "Escape") {
            closeGalleryPhotoViewer();
        } else if (event.key === "ArrowLeft") {
            changeGalleryImage(-1);
        } else if (event.key === "ArrowRight") {
            changeGalleryImage(1);
        }

        return;
    }

    if (albumView?.classList.contains("active") && event.key === "Escape") {
        closeGalleryAlbum();
    }
});


loadGalleryPage();

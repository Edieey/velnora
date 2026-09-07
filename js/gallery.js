const GALLERY_CACHE_KEY = "velnora-gallery-cache-v1";
const GALLERY_CACHE_TIME = "velnora-gallery-cache-time";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


async function loadGalleryPage() {

    const container = document.getElementById("galleryContainer");

    if (!container) return;


    /* =========================
       LOAD CACHE
    ========================= */

    const cachedGallery =
        localStorage.getItem(GALLERY_CACHE_KEY);

    const cacheTime =
        localStorage.getItem(GALLERY_CACHE_TIME);

    const cacheValid =
        cachedGallery &&
        cacheTime &&
        (Date.now() - Number(cacheTime) < CACHE_DURATION);


    if (cacheValid) {

        const galleryItems =
            JSON.parse(cachedGallery);

        container.innerHTML =
            galleryItems.map(item => `

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


    /* =========================
       LOAD FROM GITHUB
    ========================= */

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/gallery"
        );

        const files = await response.json();


        if (!Array.isArray(files)) {
            throw new Error("Gallery folder could not be loaded.");
        }


        const galleryPromises = files

            .filter(file =>
                file.name.endsWith(".md")
            )

            .map(async (file) => {

                const fileResponse =
                    await fetch(file.download_url);

                const text =
                    await fileResponse.text();


                /* =========================
                   ALBUM TITLE
                ========================= */

                const title =
                    text
                        .match(/title:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim()
                    || "Gallery";


                /* =========================
                   NEW MULTI-IMAGE FORMAT
                ========================= */

                const images = [];


                const imageBlock =
                    text.match(
                        /images:\s*([\s\S]*?)(?=\n\w|$)/
                    );


                if (imageBlock) {

                    imageBlock[1]

                        .split("\n")

                        .map(line =>
                            line.trim()
                        )

                        .filter(line =>
                            line.startsWith("-")
                        )

                        .map(line =>
                            line
                                .replace(/^-\s*/, "")
                                .replace(/"/g, "")
                                .trim()
                        )

                        .filter(Boolean)

                        .forEach(image => {

                            images.push(image);

                        });

                }


                /* =========================
                   OLD FORMAT SUPPORT
                   ========================= */

                const oldImage =
                    text
                        .match(/image:\s*(.*)/)?.[1]
                        ?.replace(/"/g, "")
                        ?.trim();


                if (
                    oldImage &&
                    !images.includes(oldImage)
                ) {

                    images.push(oldImage);

                }


                return {
                    title,
                    images
                };

            });


        const albums =
            await Promise.all(galleryPromises);


        /* =========================
           TURN ALBUMS INTO
           INDIVIDUAL GALLERY ITEMS
        ========================= */

        let galleryItems = [];


        albums.forEach(album => {

            album.images.forEach(image => {

                galleryItems.push({

                    title: album.title,

                    image: image

                });

            });

        });


        /* =========================
           NEWEST ALBUM FIRST
        ========================= */

        galleryItems.reverse();


        /* =========================
           SAVE CACHE
        ========================= */

        localStorage.setItem(
            GALLERY_CACHE_KEY,
            JSON.stringify(galleryItems)
        );

        localStorage.setItem(
            GALLERY_CACHE_TIME,
            Date.now()
        );


        /* =========================
           DISPLAY GALLERY
        ========================= */

        container.innerHTML =
            galleryItems.map(item => `

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

        console.error(
            "Gallery Error:",
            error
        );

    }

}


loadGalleryPage();
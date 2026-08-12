// ============================================================
// VELNORA CMS HERO
// Supports:
// VIDEO
// IMAGE
// SLIDESHOW
// ============================================================

async function loadHero() {

    try {

        // ----------------------------------------------------
        // Find hero section
        // ----------------------------------------------------

        const heroSection = document.querySelector(".hero");

        if (!heroSection) return;


        // ----------------------------------------------------
        // Fetch latest CMS file
        // Cache-busting prevents an old hero.md being used
        // ----------------------------------------------------

        const response = await fetch(
            `content/hero/hero.md?t=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error("Could not load hero.md");
        }

        const text = await response.text();


        // ----------------------------------------------------
        // Read simple CMS fields
        // ----------------------------------------------------

        const getField = (field) => {

            const regex = new RegExp(
                `^${field}:\\s*(.*)$`,
                "m"
            );

            const match = text.match(regex);

            return match
                ? match[1]
                    .replace(/^["']|["']$/g, "")
                    .trim()
                : "";
        };


        const headline = getField("headline");
        const button = getField("button");
        const link = getField("link");
        const type = getField("type").toLowerCase();
        const video = getField("video");
        const image = getField("image");


        // ----------------------------------------------------
        // Headline
        // ----------------------------------------------------

        const headlineEl =
            document.getElementById("heroHeadline");

        if (headlineEl && headline) {
            headlineEl.textContent = headline;
        }


        // ----------------------------------------------------
        // Button
        // ----------------------------------------------------

        const buttonEl =
            document.getElementById("heroButton");

        if (buttonEl) {

            if (button) {
                buttonEl.textContent = button;
            }

            if (link) {
                buttonEl.href = link;
            }

        }


        // ----------------------------------------------------
        // Remove old slideshow if one exists
        // ----------------------------------------------------

        const oldSlideshow =
            heroSection.querySelector(".hero-slideshow");

        if (oldSlideshow) {
            oldSlideshow.remove();
        }


        // ----------------------------------------------------
        // VIDEO
        // ----------------------------------------------------

        const heroVideo =
            document.getElementById("heroVideo");

        const heroVideoSource =
            document.getElementById("heroVideoSource");


        if (type === "video") {

            if (!heroVideo || !heroVideoSource) return;

            heroVideo.style.display = "block";

            heroVideoSource.src = video;

            heroVideo.load();

            heroVideo.play().catch(() => {});


            heroSection.style.backgroundImage = "none";

            return;
        }


        // ----------------------------------------------------
        // IMAGE
        // ----------------------------------------------------

        if (type === "image") {

            if (heroVideo) {
                heroVideo.pause();
                heroVideo.style.display = "none";
            }

            heroSection.style.backgroundImage =
                `url("${image}")`;

            heroSection.style.backgroundSize = "cover";

            heroSection.style.backgroundPosition =
                "center center";

            heroSection.style.backgroundRepeat =
                "no-repeat";

            return;
        }


        // ----------------------------------------------------
        // SLIDESHOW
        // ----------------------------------------------------

        if (type === "slideshow") {

            if (heroVideo) {
                heroVideo.pause();
                heroVideo.style.display = "none";
            }


            // ------------------------------------------------
            // Read hero_images from YAML
            // ------------------------------------------------

            const heroImages = [];

            const heroImagesMatch = text.match(
                /hero_images:\s*\n([\s\S]*?)(?=\n[a-zA-Z_]+:|\n---|\s*$)/
            );


            if (heroImagesMatch) {

                const imageLines =
                    heroImagesMatch[1].match(
                        /^\s*-\s*(?:hero_image:\s*)?(.+)$/gm
                    );

                if (imageLines) {

                    imageLines.forEach(line => {

                        const cleanImage =
                            line
                                .replace(
                                    /^\s*-\s*(?:hero_image:\s*)?/,
                                    ""
                                )
                                .replace(/^["']|["']$/g, "")
                                .trim();

                        if (cleanImage) {
                            heroImages.push(cleanImage);
                        }

                    });

                }

            }


            // ------------------------------------------------
            // Safety check
            // ------------------------------------------------

            if (heroImages.length === 0) {

                console.warn(
                    "Hero slideshow selected, but no hero images were found."
                );

                heroSection.style.backgroundImage =
                    image
                        ? `url("${image}")`
                        : "none";

                return;
            }


            // ------------------------------------------------
            // Create slideshow
            // ------------------------------------------------

            const slideshow =
                document.createElement("div");

            slideshow.className =
                "hero-slideshow";


            // Put slideshow inside hero
            heroSection.prepend(slideshow);


            // ------------------------------------------------
            // Create each image slide
            // ------------------------------------------------

            heroImages.forEach((imagePath, index) => {

                const slide =
                    document.createElement("div");

                slide.className =
                    "hero-slide";


                if (index === 0) {
                    slide.classList.add("active");
                }


                slide.style.backgroundImage =
                    `url("${imagePath}")`;


                slideshow.appendChild(slide);

            });


            // ------------------------------------------------
            // Slideshow controls
            // ------------------------------------------------

            const slides =
                slideshow.querySelectorAll(".hero-slide");

            let currentSlide = 0;


            // ------------------------------------------------
            // Change slide
            // ------------------------------------------------

            function showSlide(index) {

                slides.forEach(slide => {
                    slide.classList.remove("active");
                });

                slides[index].classList.add("active");

            }


            // ------------------------------------------------
            // Automatic slideshow
            // 5 seconds per image
            // ------------------------------------------------

            if (slides.length > 1) {

                setInterval(() => {

                    currentSlide++;

                    if (
                        currentSlide >= slides.length
                    ) {
                        currentSlide = 0;
                    }

                    showSlide(currentSlide);

                }, 5000);

            }


            console.log(
                "VELNORA Hero Slideshow loaded:",
                heroImages
            );

            return;
        }


        // ----------------------------------------------------
        // Unknown type
        // ----------------------------------------------------

        console.warn(
            "Unknown hero type:",
            type
        );

    }

    catch (error) {

        console.error(
            "Hero CMS Error:",
            error
        );

    }

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadHero
);
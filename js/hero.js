// ============================================================
// VELNORA HERO CMS
// Supports: video / image / slideshow
// ============================================================

async function loadHero() {

    try {

        // ====================================================
        // HERO SECTION
        // ====================================================

        const heroSection = document.querySelector(".hero");

        if (!heroSection) {
            console.error("VELNORA: Hero section not found.");
            return;
        }


        // ====================================================
        // LOAD HERO CMS FILE
        // ====================================================

        const response = await fetch(
            `content/hero/hero.md?t=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error(
                `Could not load hero.md (${response.status})`
            );
        }

        const text = await response.text();

        console.log("VELNORA: hero.md loaded.");
        console.log("VELNORA: hero.md content:", text);


        // ====================================================
        // FIELD READER
        // ====================================================

        function getField(field) {

            const regex = new RegExp(
                `^${field}:\\s*(.*)$`,
                "m"
            );

            const match = text.match(regex);

            if (!match) {
                return "";
            }

            return match[1]
                .replace(/^["']|["']$/g, "")
                .trim();
        }


        // ====================================================
        // READ BASIC CMS FIELDS
        // ====================================================

        const headline = getField("headline");
        const button = getField("button");
        const link = getField("link");
        const type = getField("type").toLowerCase();
        const video = getField("video");
        const image = getField("image");


        console.log("VELNORA hero type:", type);


        // ====================================================
        // HEADLINE
        // ====================================================

        const headlineEl =
            document.getElementById("heroHeadline");

        if (headlineEl && headline) {
            headlineEl.textContent = headline;
        }


        // ====================================================
        // BUTTON
        // ====================================================

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


        // ====================================================
        // VIDEO
        // ====================================================

        const heroVideo =
            document.getElementById("heroVideo");

        const heroVideoSource =
            document.getElementById("heroVideoSource");


        // ====================================================
        // VIDEO MODE
        // ====================================================

        if (type === "video") {

            console.log("VELNORA: VIDEO MODE");

            if (!heroVideo || !heroVideoSource) {
                console.error(
                    "VELNORA: Video elements not found."
                );

                return;
            }

            heroVideo.style.display = "block";

            heroVideoSource.src = video;

            heroVideo.load();

            heroVideo.play().catch(() => {});

            heroSection.style.backgroundImage = "none";

            return;
        }


        // ====================================================
        // SINGLE IMAGE MODE
        // ====================================================

        if (type === "image") {

            console.log("VELNORA: IMAGE MODE");

            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display = "none";

            }

            heroSection.style.backgroundImage =
                `url("${image}")`;

            heroSection.style.backgroundSize =
                "cover";

            heroSection.style.backgroundPosition =
                "center center";

            heroSection.style.backgroundRepeat =
                "no-repeat";

            heroSection.style.backgroundColor =
                "#000";

            return;
        }


        // ====================================================
        // SLIDESHOW MODE
        // ====================================================

        if (type === "slideshow") {

            console.log(
                "VELNORA: SLIDESHOW MODE"
            );


            // ------------------------------------------------
            // Hide video
            // ------------------------------------------------

            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display = "none";

            }


            // ------------------------------------------------
            // REMOVE OLD SLIDESHOW
            // ------------------------------------------------

            const oldSlideshow =
                heroSection.querySelector(
                    ".hero-slideshow"
                );

            if (oldSlideshow) {
                oldSlideshow.remove();
            }


            // =================================================
            // READ SLIDES
            // =================================================

            const slides = [];


            /*
             * Find the "slides:" section.
             *
             * Example:
             *
             * slides:
             *   - image: /images/uploads/image1.jpg
             *   - image: /images/uploads/image2.png
             */

            const slidesStart =
                text.indexOf("slides:");

            if (slidesStart !== -1) {

                const slidesText =
                    text.substring(slidesStart);


                const matches =
                    slidesText.matchAll(
                        /^\s*-\s*image:\s*(.+)$/gm
                    );


                for (const match of matches) {

                    let imagePath =
                        match[1]
                            .replace(/^["']|["']$/g, "")
                            .trim();


                    // Remove accidental trailing spaces
                    imagePath =
                        imagePath.trim();


                    if (imagePath) {

                        slides.push(
                            imagePath
                        );

                    }

                }

            }


            // =================================================
            // DEBUG
            // =================================================

            console.log(
                "VELNORA slideshow images:",
                slides
            );


            // =================================================
            // NO SLIDES
            // =================================================

            if (slides.length === 0) {

                console.error(
                    "VELNORA ERROR: No slideshow images found."
                );

                console.error(
                    "Check hero.md -> slides:"
                );

                return;
            }


            // =================================================
            // CREATE SLIDESHOW
            // =================================================

            const slideshow =
                document.createElement("div");

            slideshow.className =
                "hero-slideshow";


            slideshow.id =
                "heroSlider";


            heroSection.prepend(
                slideshow
            );


            // =================================================
            // CREATE EACH SLIDE
            // =================================================

            slides.forEach(
                (imagePath, index) => {

                    const slide =
                        document.createElement(
                            "div"
                        );


                    slide.className =
                        "hero-slide";


                    if (index === 0) {

                        slide.classList.add(
                            "active"
                        );

                    }


                    slide.style.backgroundImage =
                        `url("${imagePath}")`;


                    slideshow.appendChild(
                        slide
                    );

                }
            );


            // =================================================
            // GET SLIDES
            // =================================================

            const slideElements =
                slideshow.querySelectorAll(
                    ".hero-slide"
                );


            console.log(
                "VELNORA: Created slides:",
                slideElements.length
            );


            // =================================================
            // SLIDE CONTROL
            // =================================================

            let currentSlide = 0;


            function showSlide(index) {

                slideElements.forEach(
                    slide => {

                        slide.classList.remove(
                            "active"
                        );

                    }
                );


                slideElements[index]
                    .classList.add("active");

            }


            // =================================================
            // AUTOMATIC SLIDESHOW
            // =================================================

            if (slideElements.length > 1) {

                setInterval(
                    () => {

                        currentSlide++;

                        if (
                            currentSlide >=
                            slideElements.length
                        ) {

                            currentSlide = 0;

                        }

                        showSlide(
                            currentSlide
                        );

                    },
                    5000
                );

            }


            console.log(
                "VELNORA: Slideshow started."
            );

            return;
        }


        // ====================================================
        // UNKNOWN TYPE
        // ====================================================

        console.warn(
            "VELNORA: Unknown hero type:",
            type
        );

    }

    catch (error) {

        console.error(
            "VELNORA Hero CMS Error:",
            error
        );

    }

}


// ============================================================
// START HERO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadHero
);
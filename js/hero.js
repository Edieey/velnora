// ============================================================
// VELNORA HERO CMS
// Supports: video / image / slideshow
// ============================================================

async function loadHero() {

    try {

        const heroSection = document.querySelector(".hero");

        if (!heroSection) return;


        // ====================================================
        // LOAD HERO CMS FILE
        // ====================================================

        const response = await fetch(
            `content/hero/hero.md?t=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error("Could not load hero.md");
        }

        const text = await response.text();


        // ====================================================
        // SIMPLE FIELD READER
        // ====================================================

        function getField(field) {

            const regex = new RegExp(
                `^${field}:\\s*(.*)$`,
                "m"
            );

            const match = text.match(regex);

            if (!match) return "";

            return match[1]
                .replace(/^["']|["']$/g, "")
                .trim();

        }


        const headline = getField("headline");
        const button = getField("button");
        const link = getField("link");
        const type = getField("type").toLowerCase();
        const video = getField("video");
        const image = getField("image");


        // ====================================================
        // HERO HEADLINE
        // ====================================================

        const headlineEl =
            document.getElementById("heroHeadline");

        if (headlineEl && headline) {
            headlineEl.textContent = headline;
        }


        // ====================================================
        // HERO BUTTON
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
        // GET HERO SLIDER
        // ====================================================

        const heroSlider =
            document.getElementById("heroSlider");


        // ====================================================
        // GET HERO VIDEO
        // ====================================================

        const heroVideo =
            document.getElementById("heroVideo");

        const heroVideoSource =
            document.getElementById("heroVideoSource");


        // ====================================================
        // CLEAR OLD SLIDES
        // ====================================================

        if (heroSlider) {
            heroSlider.innerHTML = "";
        }


        // ====================================================
        // VIDEO MODE
        // ====================================================

        if (type === "video") {

            console.log("VELNORA: Video mode");


            if (heroSlider) {
                heroSlider.style.display = "none";
            }


            if (!heroVideo || !heroVideoSource) {
                return;
            }


            heroVideo.style.display = "block";

            heroVideoSource.src = video;

            heroVideo.load();

            heroVideo.play().catch(() => {});


            return;
        }


        // ====================================================
        // SINGLE IMAGE MODE
        // ====================================================

        if (type === "image") {

            console.log("VELNORA: Image mode");


            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display = "none";

            }


            if (!heroSlider) {
                return;
            }


            heroSlider.style.display = "block";


            const slide =
                document.createElement("div");

            slide.className =
                "hero-slide active";


            slide.style.backgroundImage =
                `url("${image}")`;


            heroSlider.appendChild(slide);


            return;
        }


        // ====================================================
        // SLIDESHOW MODE
        // ====================================================

        if (type === "slideshow") {

            console.log(
                "VELNORA: Slideshow mode"
            );


            // ------------------------------------------------
            // Hide video
            // ------------------------------------------------

            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display = "none";

            }


            if (!heroSlider) {

                console.error(
                    "VELNORA: #heroSlider not found"
                );

                return;

            }


            heroSlider.style.display = "block";


            // ------------------------------------------------
            // READ CMS SLIDES
            //
            // slides:
            //   - image: /images/uploads/image1.jpg
            //   - image: /images/uploads/image2.jpg
            // ------------------------------------------------

            const slides = [];


            const slideMatches =
                text.matchAll(
                    /^\s*-\s*image:\s*(.+)$/gm
                );


            for (const match of slideMatches) {

                const imagePath =
                    match[1]
                        .replace(/^["']|["']$/g, "")
                        .trim();


                if (imagePath) {
                    slides.push(imagePath);
                }

            }


            console.log(
                "VELNORA slideshow images:",
                slides
            );


            // ------------------------------------------------
            // No images
            // ------------------------------------------------

            if (slides.length === 0) {

                console.error(
                    "VELNORA: No slideshow images found"
                );

                return;

            }


            // =================================================
            // CREATE SLIDES
            // =================================================

            slides.forEach(
                (imagePath, index) => {

                    const slide =
                        document.createElement("div");


                    slide.className =
                        "hero-slide";


                    if (index === 0) {
                        slide.classList.add(
                            "active"
                        );
                    }


                    slide.style.backgroundImage =
                        `url("${imagePath}")`;


                    heroSlider.appendChild(
                        slide
                    );

                }
            );


            // =================================================
            // GET CREATED SLIDES
            // =================================================

            const slideElements =
                heroSlider.querySelectorAll(
                    ".hero-slide"
                );


            let currentSlide = 0;


            // =================================================
            // SHOW SLIDE
            // =================================================

            function showSlide(index) {

                slideElements.forEach(
                    (slide) => {

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

                setInterval(() => {

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


                }, 5000);

            }


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
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadHero
);
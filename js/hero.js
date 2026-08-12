async function loadHero() {

    try {

        const response = await fetch("content/hero/hero.md");

        const text = await response.text();


        // =====================================================
        // READ NORMAL CMS FIELDS
        // =====================================================

        const getField = (field) => {

            const match = text.match(
                new RegExp(`^${field}:\\s*(.*)$`, "m")
            );

            return match
                ? match[1]
                    .replace(/"/g, "")
                    .trim()
                : "";

        };


        const headline = getField("headline");
        const button = getField("button");
        const link = getField("link");
        const type = getField("type");
        const video = getField("video");
        const image = getField("image");


        // =====================================================
        // HERO ELEMENTS
        // =====================================================

        const headlineEl =
            document.getElementById("heroHeadline");

        const buttonEl =
            document.getElementById("heroButton");

        const heroVideo =
            document.getElementById("heroVideo");

        const heroVideoSource =
            document.getElementById("heroVideoSource");

        const heroSection =
            document.querySelector(".hero");


        if (!heroSection) return;


        // =====================================================
        // HEADLINE
        // =====================================================

        if (headlineEl) {

            headlineEl.textContent = headline;

        }


        // =====================================================
        // BUTTON
        // =====================================================

        if (buttonEl) {

            buttonEl.textContent = button;

            buttonEl.href = link;

        }


        // =====================================================
        // SLIDESHOW
        // =====================================================

        if (type === "slideshow") {

            // Hide old video if it exists

            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display = "none";

            }


            // -------------------------------------------------
            // CREATE SLIDESHOW CONTAINER
            // -------------------------------------------------

            let slider =
                document.getElementById("heroSlider");


            if (!slider) {

                slider =
                    document.createElement("div");

                slider.id = "heroSlider";

                slider.className =
                    "hero-slider";


                // Put slideshow at the beginning
                // of the hero section

                heroSection.prepend(slider);

            }


            // -------------------------------------------------
            // READ SLIDES FROM hero.md
            // -------------------------------------------------

            const slidesSection =
                text.match(
                    /slides:\s*([\s\S]*?)(?=\n---|\s*$)/
                );


            if (!slidesSection) {

                console.warn(
                    "VELNORA Hero: No slideshow images found."
                );

                return;

            }


            const slideImages = [
                ...slidesSection[1].matchAll(
                    /^\s*-\s*image:\s*(.+)$/gm
                )
            ]
            .map(match =>
                match[1]
                    .replace(/"/g, "")
                    .trim()
            )
            .filter(Boolean);


            if (!slideImages.length) {

                console.warn(
                    "VELNORA Hero: Slideshow is empty."
                );

                return;

            }


            // -------------------------------------------------
            // CREATE SLIDES
            // -------------------------------------------------

            slider.innerHTML =
                slideImages.map(
                    (slideImage, index) => {

                        return `
                            <div
                                class="hero-slide ${
                                    index === 0
                                        ? "active"
                                        : ""
                                }"
                                style="
                                    background-image:
                                    url('${slideImage}');
                                ">
                            </div>
                        `;

                    }
                ).join("");


            // -------------------------------------------------
            // MAKE SURE HERO HAS CORRECT LAYERS
            // -------------------------------------------------

            heroSection.style.backgroundImage = "none";


            // -------------------------------------------------
            // START SLIDESHOW
            // -------------------------------------------------

            let currentSlide = 0;


            if (slideImages.length > 1) {

                setInterval(() => {

                    const slides =
                        slider.querySelectorAll(
                            ".hero-slide"
                        );


                    if (!slides.length) return;


                    slides[currentSlide]
                        .classList.remove("active");


                    currentSlide++;


                    if (
                        currentSlide >=
                        slides.length
                    ) {

                        currentSlide = 0;

                    }


                    slides[currentSlide]
                        .classList.add("active");


                }, 5000);

            }


            return;

        }


        // =====================================================
        // VIDEO MODE
        // =====================================================

        if (
            type === "video" &&
            heroVideo &&
            heroVideoSource
        ) {

            heroVideo.style.display = "block";

            heroVideoSource.src = video;

            heroVideo.load();


            heroVideo.addEventListener(
                "loadeddata",
                () => {

                    heroVideo
                        .play()
                        .catch(() => {});

                },
                { once: true }
            );


            heroSection.style.backgroundImage =
                "none";


            return;

        }


        // =====================================================
        // SINGLE IMAGE MODE
        // =====================================================

        if (
            type === "image"
        ) {

            if (heroVideo) {

                heroVideo.style.display =
                    "none";

            }


            heroSection.style.backgroundImage =
                `url('${image}')`;


            heroSection.style.backgroundSize =
                "cover";


            heroSection.style.backgroundPosition =
                "center";


            return;

        }


    }

    catch (error) {

        console.error(
            "Hero CMS Error:",
            error
        );

    }

}


document.addEventListener(
    "DOMContentLoaded",
    loadHero
);
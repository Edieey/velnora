// ============================================================
// VELNORA HERO CMS
// Supports: video / image / slideshow
// ============================================================

let velnoraHeroTimer = null;


// ============================================================
// LOAD HERO
// ============================================================

async function loadHero() {

    try {

        // ====================================================
        // HERO SECTION
        // ====================================================

        const heroSection =
            document.querySelector(".hero");

        if (!heroSection) {
            console.error(
                "VELNORA: Hero section not found."
            );
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

        console.log(
            "VELNORA: hero.md loaded."
        );

        console.log(
            "VELNORA: hero.md content:",
            text
        );


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
        // READ CMS FIELDS
        // ====================================================

        const headline =
            getField("headline");

        const button =
            getField("button");

        const link =
            getField("link");

        const type =
            getField("type").toLowerCase();

        const video =
            getField("video");

        const image =
            getField("image");


        console.log(
            "VELNORA hero type:",
            type
        );


        // ====================================================
        // HELPER — CLEAN ASSET PATH
        // ====================================================

        function cleanAssetPath(path) {

            if (!path) {
                return "";
            }

            return path
                .replace(/^["']|["']$/g, "")
                .trim();
        }


        // ====================================================
        // HELPER — REMOVE OLD SLIDESHOW
        // ====================================================

        function removeSlideshow() {

            if (velnoraHeroTimer) {

                clearInterval(
                    velnoraHeroTimer
                );

                velnoraHeroTimer = null;
            }

            const oldSlideshows =
                heroSection.querySelectorAll(
                    ".hero-slideshow"
                );

            oldSlideshows.forEach(
                slideshow => slideshow.remove()
            );
        }


        // ====================================================
        // HELPER — RESET HERO
        // ====================================================

        function resetHero() {

            removeSlideshow();


            // Stop video
            const heroVideo =
                document.getElementById(
                    "heroVideo"
                );

            const heroVideoSource =
                document.getElementById(
                    "heroVideoSource"
                );


            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display =
                    "none";

                heroVideo.removeAttribute(
                    "src"
                );
            }


            if (heroVideoSource) {

                heroVideoSource.removeAttribute(
                    "src"
                );
            }


            // Reset hero background
            heroSection.style.backgroundImage =
                "none";

            heroSection.style.backgroundSize =
                "";

            heroSection.style.backgroundPosition =
                "";

            heroSection.style.backgroundRepeat =
                "";

            heroSection.style.backgroundColor =
                "#000";
        }


        // ====================================================
        // HEADLINE
        // ====================================================

        const headlineEl =
            document.getElementById(
                "heroHeadline"
            );

        if (headlineEl && headline) {

            headlineEl.textContent =
                headline;
        }


        // ====================================================
        // BUTTON
        // ====================================================

        const buttonEl =
            document.getElementById(
                "heroButton"
            );

        if (buttonEl) {

            if (button) {

                buttonEl.textContent =
                    button;
            }

            if (link) {

                buttonEl.href =
                    link;
            }
        }


        // ====================================================
        // VIDEO ELEMENTS
        // ====================================================

        const heroVideo =
            document.getElementById(
                "heroVideo"
            );

        const heroVideoSource =
            document.getElementById(
                "heroVideoSource"
            );


        // ====================================================
        // RESET EVERYTHING BEFORE MODE
        // ====================================================

        resetHero();


        // ====================================================
        // VIDEO MODE
        // ====================================================

        if (type === "video") {

            console.log(
                "VELNORA: VIDEO MODE"
            );


            if (!heroVideo) {

                console.error(
                    "VELNORA: Hero video element not found."
                );

                return;
            }


            if (!video) {

                console.error(
                    "VELNORA: No video path found."
                );

                return;
            }


            const videoPath =
                cleanAssetPath(video);


            if (heroVideoSource) {

                heroVideoSource.src =
                    videoPath;
            }


            heroVideo.style.display =
                "block";

            heroVideo.load();


            heroVideo.play().catch(
                error => {

                    console.warn(
                        "VELNORA: Video autoplay blocked:",
                        error
                    );
                }
            );


            heroSection.style.backgroundImage =
                "none";


            console.log(
                "VELNORA: Video applied:",
                videoPath
            );


            return;
        }


// ====================================================
// SINGLE IMAGE MODE
// ====================================================

if (type === "image") {

    console.log("VELNORA: IMAGE MODE");


    // ------------------------------------------------
    // Check that CMS supplied an image
    // ------------------------------------------------

    if (!image) {

        console.error(
            "VELNORA ERROR: No hero image found."
        );

        return;
    }


    // ------------------------------------------------
    // Clean CMS image path
    // ------------------------------------------------

    const imagePath =
        cleanAssetPath(image);


    console.log(
        "VELNORA: Image path:",
        imagePath
    );


    // ------------------------------------------------
    // Hide video
    // ------------------------------------------------

    if (heroVideo) {

        heroVideo.pause();

        heroVideo.style.display = "none";
        heroVideo.style.visibility = "hidden";
    }


    // ------------------------------------------------
    // Remove video source
    // ------------------------------------------------

    if (heroVideoSource) {

        heroVideoSource.removeAttribute("src");
    }


    // ------------------------------------------------
    // Remove slideshow
    // ------------------------------------------------

    removeSlideshow();


    // ------------------------------------------------
    // Remove any old single hero image
    // ------------------------------------------------

    const oldHeroImage =
        heroSection.querySelector(
            ".hero-single-image"
        );

    if (oldHeroImage) {

        oldHeroImage.remove();
    }


    // ------------------------------------------------
    // Create the hero image
    // ------------------------------------------------

    const heroImage =
        document.createElement("img");


    heroImage.className =
        "hero-single-image";


    heroImage.src =
        imagePath;


    heroImage.alt =
        "VELNORA";


    // ------------------------------------------------
    // Image loaded successfully
    // ------------------------------------------------

    heroImage.onload = () => {

        console.log(
            "VELNORA: Single image loaded successfully:",
            imagePath
        );
    };


    // ------------------------------------------------
    // Image failed
    // ------------------------------------------------

    heroImage.onerror = () => {

        console.error(
            "VELNORA ERROR: Single image failed to load:",
            imagePath
        );
    };


    // ------------------------------------------------
    // Add image to hero
    // ------------------------------------------------

    heroSection.appendChild(
        heroImage
    );


    // ------------------------------------------------
    // Make sure hero can contain the image
    // ------------------------------------------------

    heroSection.style.position =
        "relative";

    heroSection.style.overflow =
        "hidden";


    console.log(
        "VELNORA: Single image applied:",
        imagePath
    );


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
            // Make sure video is hidden
            // ------------------------------------------------

            if (heroVideo) {

                heroVideo.pause();

                heroVideo.style.display =
                    "none";
            }


            if (heroVideoSource) {

                heroVideoSource.removeAttribute(
                    "src"
                );
            }


            // ------------------------------------------------
            // Remove previous slideshow
            // ------------------------------------------------

            removeSlideshow();


            // ------------------------------------------------
            // Read slideshow images
            // ------------------------------------------------

            const slides = [];


            const slidesStart =
                text.indexOf("slides:");


            if (slidesStart !== -1) {

                const slidesText =
                    text.substring(
                        slidesStart
                    );


                // =================================================
                // CMS FORMAT
                //
                // slides:
                //   - image: /images/uploads/photo1.jpg
                //   - image: /images/uploads/photo2.jpg
                // =================================================

                const objectMatches =
                    slidesText.matchAll(
                        /^\s*-\s*image:\s*(.+)$/gm
                    );


                for (
                    const match
                    of objectMatches
                ) {

                    const imagePath =
                        cleanAssetPath(
                            match[1]
                        );


                    if (imagePath) {

                        slides.push(
                            imagePath
                        );
                    }
                }


                // =================================================
                // BACKWARD COMPATIBILITY
                //
                // Also supports:
                //
                // slides:
                //   - /images/uploads/photo1.jpg
                //   - /images/uploads/photo2.jpg
                // =================================================

                const simpleMatches =
                    slidesText.matchAll(
                        /^\s*-\s+(?!image:)(.+)$/gm
                    );


                for (
                    const match
                    of simpleMatches
                ) {

                    const imagePath =
                        cleanAssetPath(
                            match[1]
                        );


                    if (
                        imagePath &&
                        !slides.includes(
                            imagePath
                        )
                    ) {

                        slides.push(
                            imagePath
                        );
                    }
                }
            }


            // ------------------------------------------------
            // DEBUG
            // ------------------------------------------------

            console.log(
                "VELNORA slideshow images:",
                slides
            );


            // ------------------------------------------------
            // No slides
            // ------------------------------------------------

            if (slides.length === 0) {

                console.error(
                    "VELNORA ERROR: No slideshow images found."
                );

                console.error(
                    "Check hero.md -> slides:"
                );

                return;
            }


            // ------------------------------------------------
            // Create slideshow
            // ------------------------------------------------

            const slideshow =
                document.createElement(
                    "div"
                );


            slideshow.className =
                "hero-slideshow";


            slideshow.id =
                "heroSlider";


            heroSection.prepend(
                slideshow
            );


            // ------------------------------------------------
            // Create slides
            // ------------------------------------------------

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


            // ------------------------------------------------
            // Get created slides
            // ------------------------------------------------

            const slideElements =
                slideshow.querySelectorAll(
                    ".hero-slide"
                );


            console.log(
                "VELNORA: Created slides:",
                slideElements.length
            );


            // ------------------------------------------------
            // Slide control
            // ------------------------------------------------

            let currentSlide = 0;


            function showSlide(index) {

                slideElements.forEach(
                    slide => {

                        slide.classList.remove(
                            "active"
                        );
                    }
                );


                if (
                    slideElements[index]
                ) {

                    slideElements[index]
                        .classList.add(
                            "active"
                        );
                }
            }


            // ------------------------------------------------
            // Automatic slideshow
            // ------------------------------------------------

            if (
                slideElements.length > 1
            ) {

                velnoraHeroTimer =
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
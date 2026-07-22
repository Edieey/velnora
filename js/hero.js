async function loadHero() {

    try {

        const response = await fetch("content/hero/hero.md");
        const text = await response.text();

        const getField = (field) => {
            const match = text.match(new RegExp(`${field}:\\s*(.*)`));
            return match ? match[1].replace(/"/g, "").trim() : "";
        };

        const headline = getField("headline");
        const button = getField("button");
        const link = getField("link");
        const type = getField("type");
        const video = getField("video");
        const image = getField("image");

        const headlineEl = document.getElementById("heroHeadline");
        const buttonEl = document.getElementById("heroButton");
        const heroVideo = document.getElementById("heroVideo");
        const heroVideoSource = document.getElementById("heroVideoSource");
        const heroSection = document.querySelector(".hero");

        if (headlineEl) headlineEl.textContent = headline;

        if (buttonEl) {
            buttonEl.textContent = button;
            buttonEl.href = link;
        }

        if (type === "video") {

            heroVideo.style.display = "block";

heroVideoSource.src = video;
heroVideo.load();

heroVideo.addEventListener(
    "loadeddata",
    () => {
        heroVideo.play().catch(() => {});
    },
    { once: true }
);

            heroSection.style.backgroundImage = "none";

        } else if (type === "image") {

            heroVideo.style.display = "none";

            heroSection.style.backgroundImage = `url('${image}')`;
            heroSection.style.backgroundSize = "cover";
            heroSection.style.backgroundPosition = "center";

        }

    }

    catch (error) {

        console.error("Hero CMS Error:", error);

    }

}

document.addEventListener("DOMContentLoaded", loadHero);
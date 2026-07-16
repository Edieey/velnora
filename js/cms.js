async function fetchMarkdown(path) {
    const response = await fetch(path);
    return await response.text();
}

function getField(text, field, fallback = "") {
    const match = text.match(new RegExp(`${field}:\\s*(.*)`));
    return match
        ? match[1].replace(/"/g, "").trim()
        : fallback;
}

/* ---------------- HERO ---------------- */

async function loadHero() {

    try {

        const text = await fetchMarkdown("content/hero/hero.md");

        const headline = getField(text, "headline");
        const button = getField(text, "button");
        const link = getField(text, "link");
        const type = getField(text, "type");
        const video = getField(text, "video");
        const image = getField(text, "image");

        const headlineEl = document.getElementById("heroHeadline");
        const buttonEl = document.getElementById("heroButton");

        if (headlineEl) headlineEl.textContent = headline;

        if (buttonEl) {
            buttonEl.textContent = button;
            buttonEl.href = link;
        }

        const heroVideo = document.getElementById("heroVideo");
        const heroVideoSource = document.getElementById("heroVideoSource");

        if (heroVideo && heroVideoSource) {

            if (type === "video") {

                heroVideo.style.display = "block";

                heroVideoSource.src = video;

                heroVideo.load();

            } else {

                heroVideo.style.display = "none";

                document.querySelector(".hero").style.backgroundImage =
                    `url('${image}')`;

                document.querySelector(".hero").style.backgroundSize = "cover";
                document.querySelector(".hero").style.backgroundPosition = "center";

            }

        }

    }

    catch (err) {

        console.error("Hero Error:", err);

    }

}

/* ---------------- SETTINGS ---------------- */

async function loadSettings() {

    try {

        const text = await fetchMarkdown("content/settings/website.md");

        const aboutTitle = getField(text, "about_title");
        const aboutDescription = getField(text, "about_description");

        const phone = getField(text, "phone");
        const email = getField(text, "email");
        const instagram = getField(text, "instagram");
        const address = getField(text, "address");

        const bookingTitle = getField(text, "booking_title");
        const bookingDescription = getField(text, "booking_description");
        const bookingButton = getField(text, "booking_button");

        const copyright = getField(text, "copyright");

        /* About */

        const aboutHeading =
            document.querySelector(".about-story-text h2");

        if (aboutHeading)
            aboutHeading.textContent = aboutTitle;

        const aboutParagraph =
            document.querySelector(".about-story-text p");

        if (aboutParagraph)
            aboutParagraph.textContent = aboutDescription;

        /* Booking */

        const bookingSection =
            document.querySelector(".booking-cta");

        if (bookingSection) {

            bookingSection.querySelector("h2").textContent =
                bookingTitle;

            bookingSection.querySelector("p").textContent =
                bookingDescription;

            bookingSection.querySelector(".btn").textContent =
                bookingButton;

        }

        /* Footer */

        const footer = document.querySelector(".footer");

        if (footer) {

            const paragraphs =
                footer.querySelectorAll(".footer-info p");

            if (paragraphs.length >= 5) {

                paragraphs[0].textContent =
                    address.split("\n")[0] || "";

                paragraphs[1].textContent =
                    address.split("\n")[1] || "";

                paragraphs[2].textContent =
                    address.split("\n")[2] || "";

                paragraphs[3].innerHTML =
                    `Phone: <a href="tel:${phone}">${phone}</a>`;

                paragraphs[4].innerHTML =
                    `Email: <a href="mailto:${email}">${email}</a>`;

            }

            const insta =
                footer.querySelector(".footer-info a[target='_blank']");

            if (insta) {

                insta.href = instagram;
                insta.textContent =
                    instagram.replace("https://www.instagram.com/", "@").replace("/", "");

            }

            const copy =
                document.querySelector(".footer-copy");

            if (copy)
                copy.textContent = copyright;

        }

    }

    catch (err) {

        console.error("Settings Error:", err);

    }

}

/* ---------------- START ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
});
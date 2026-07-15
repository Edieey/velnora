async function loadGalleryPage() {

    const container = document.getElementById("galleryContainer");

    if (!container) return;

    try {

        const response = await fetch(
            "https://api.github.com/repos/Edieey/velnora/contents/content/gallery"
        );

        const files = await response.json();

        let galleryItems = [];

        for (const file of files) {

            if (!file.name.endsWith(".md")) continue;

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

            galleryItems.push({
                title,
                image
            });

        }

        galleryItems.reverse();

        container.innerHTML = galleryItems.map(item => `

            <div class="artist-card">

                <img src="${item.image}" alt="${item.title}">

            </div>

        `).join("");

    }

    catch (error) {

        console.error("Gallery Error:", error);

    }

}

loadGalleryPage();
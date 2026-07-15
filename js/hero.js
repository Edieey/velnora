loadArtists();
async function loadHero() {

    try {

const response = await fetch("content/hero/hero.md");

        const text = await response.text();

        const headline =
            text.match(/headline:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim();

        const button =
            text.match(/button:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim();

        const link =
            text.match(/link:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim();

        const video =
            text.match(/video:\s*(.*)/)?.[1]
            ?.replace(/"/g, "")
            ?.trim();

        if (headline)
            document.getElementById("heroHeadline").textContent = headline;

        if (button)
            document.getElementById("heroButton").textContent = button;

        if (link)
            document.getElementById("heroButton").href = link;

        if (video) {

            document.getElementById("heroVideoSource").src = video;

            document.getElementById("heroVideo").load();

        }

    }

    catch(error){

        console.log(error);

    }

}

loadHero();
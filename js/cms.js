async function loadSiteSettings() {

    const title = document.getElementById("aboutTitle");
    const description = document.getElementById("aboutDescription");

    if (!title || !description) return;

    try {

        const response = await fetch("content/settings/website.md");
        const text = await response.text();

        const getField = (field) => {
            const match = text.match(new RegExp(`${field}:\\s*"([^"]*)"`));
            return match ? match[1] : "";
        };

        title.textContent = getField("about_title");

        const block = text.match(
            /about_description:\s*\|([\s\S]*?)\nphone:/
        );

        if (block) {

            const html = block[1]
                .trim()
                .split("\n")
                .filter(line => line.trim())
                .map(line => `<p>${line.trim()}</p>`)
                .join("");

            description.innerHTML = html;

        }

    }

    catch (err) {

        console.error(err);

    }

}

document.addEventListener("DOMContentLoaded", loadSiteSettings);
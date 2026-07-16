async function loadSiteSettings() {

    const title = document.getElementById("aboutTitle");
    const description = document.getElementById("aboutDescription");

    if (!title || !description) return;

    try {

        const response = await fetch("content/settings/website.md");
        const text = await response.text();

        function getField(field) {

            const match = text.match(
                new RegExp(`${field}:\\s*(.*)`)
            );

            return match
                ? match[1].replace(/"/g, "").trim()
                : "";

        }

        title.textContent = getField("about_title");

        const block = text.match(
            /about_description:\s*[>|]\s*([\s\S]*?)\nphone:/
        );

        if (block) {

            const html = block[1]
                .trim()
                .split(/\n\s*\n/)
                .map(p => `<p>${p.replace(/\n/g, " ").trim()}</p>`)
                .join("");

            description.innerHTML = html;

        }

    }

    catch(err){

        console.error(err);

    }

}

document.addEventListener("DOMContentLoaded", loadSiteSettings);
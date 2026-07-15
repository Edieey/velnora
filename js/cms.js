async function fetchCollection(folder) {

    const response = await fetch(
        `https://api.github.com/repos/Edieey/velnora/contents/content/${folder}`
    );

    const files = await response.json();

    return files.filter(file => file.name.endsWith(".md"));

}

async function fetchMarkdown(url) {

    const response = await fetch(url);

    return await response.text();

}

function getField(text, field, fallback = "") {

    const match = text.match(
        new RegExp(`${field}:\\s*(.*)`)
    );

    return match
        ? match[1].replace(/"/g, "").trim()
        : fallback;

}

function getGallery(text) {

    const gallery = [];

    const matches = text.matchAll(
        /-\s*(\/images\/uploads\/.*\.(png|jpg|jpeg|webp))/g
    );

    for (const match of matches) {

        gallery.push(match[1].trim());

    }

    return gallery;

}
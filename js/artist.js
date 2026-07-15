    async function loadArtists() {

        const container = document.getElementById("artistsContainer");

        if (!container) return;

        try {

            const response = await fetch(
                "https://api.github.com/repos/Edieey/velnora/contents/content/artists"
            );

            const files = await response.json();

            let artists = [];

            for (const file of files) {

                if (!file.name.endsWith(".md")) continue;

                const fileResponse = await fetch(file.download_url);
                const text = await fileResponse.text();

                const title = text.match(/title:\s*(.*)/)?.[1]?.replace(/"/g, "").trim() || "";
                const genre = text.match(/genre:\s*(.*)/)?.[1]?.replace(/"/g, "").trim() || "";
                const image = text.match(/image:\s*(.*)/)?.[1]?.replace(/"/g, "").trim() || "";

                artists.push({
                    title,
                    genre,
                    image
                });

            }

            artists.reverse();

            container.innerHTML = artists.map(artist => `
                <div class="artist-card">
                    <img src="${artist.image}" alt="${artist.title}">
                    <h3>${artist.title}</h3>
                    <p>${artist.genre}</p>
                </div>
            `).join("");

        }

        catch (error) {

            console.error(error);

        }

    }

    loadArtists();
const STORE_API =
    "https://api.github.com/repos/Edieey/velnora/contents/content/store/products";
let storeProducts = [];
let activeStoreCategory = "all";

function parseFrontMatter(text) {

    const match =
        text.match(/^---\s*([\s\S]*?)\s*---/);

    if (!match) {
        return {};
    }

    const yaml = match[1];

    const getValue = (key) => {

        const match =
            yaml.match(
                new RegExp(
                    `^${key}:\\s*(.*)$`,
                    "m"
                )
            );

        if (!match) {
            return "";
        }

        return match[1]
            .replace(/^["']|["']$/g, "")
            .trim();
    };

    const getList = (key) => {

        const match =
            yaml.match(
                new RegExp(
                    `^${key}:\\s*([\\s\\S]*?)(?=^\\w|^---|$)`,
                    "m"
                )
            );

        if (!match) {
            return [];
        }

        return match[1]
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.startsWith("-"))
            .map(line =>
                line
                    .replace(/^-\s*/, "")
                    .replace(/^["']|["']$/g, "")
                    .trim()
            )
            .filter(Boolean);
    };

    return {
        title: getValue("title"),
        price: getValue("price"),
        image: getValue("image"),
        category: getValue("category"),
        status: getValue("status") || "available",
        buttonText:
            getValue("button_text") ||
            "VIEW PRODUCT",
        images: getList("images"),
        sizes: getList("sizes")
    };
}


function createProductCard(product) {

    const card =
        document.createElement("div");

card.className =
    "store-product-card";

    const image =
        product.image ||
        product.images[0] ||
        "";

    const status =
        product.status || "available";
        if (status === "sold-out") {
    card.classList.add("sold-out");
}

    let buttonText =
        product.buttonText;

    if (status === "sold-out") {
        buttonText = "SOLD OUT";
    }

    card.innerHTML = `

        ${
            image
                ? `
<img
    class="store-product-image"
    src="${image}"
    alt="${product.title}"
    loading="lazy"
    decoding="async">
                `
                : ""
        }

        <div class="store-product-info">

            <h3>
                ${product.title || "VELNORA Product"}
            </h3>

            ${
                product.category
                    ? `
                        <p class="store-product-category">
                            ${product.category}
                        </p>
                    `
                    : ""
            }

            ${
                product.price
                    ? `
                        <p class="store-product-price">
                            MVR ${product.price}
                        </p>
                    `
                    : ""
            }

<a
    class="btn home-events-btn store-product-button"
    href="${
        status === "sold-out"
            ? "#"
            : `product.html?slug=${encodeURIComponent(product.slug)}`
    }"
    ${
        status === "sold-out"
            ? 'aria-disabled="true"'
            : ""
    }
>
    VIEW PRODUCT
</a>

        </div>
    `;

    return card;
}

function renderStoreFilters() {

    const filterContainer =
        document.getElementById(
            "storeFilters"
        );

    if (!filterContainer) {
        return;
    }

    const categories = [
        ...new Set(
            storeProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ];

    filterContainer.innerHTML = "";

    const allCategories = [
        "all",
        ...categories
    ];

    allCategories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "store-filter-button";

            if (
                category ===
                activeStoreCategory
            ) {
                button.classList.add(
                    "active"
                );
            }

            button.textContent =
                category === "all"
                    ? "All"
                    : category
                        .replace(/-/g, " ")
                        .replace(
                            /\b\w/g,
                            letter =>
                                letter.toUpperCase()
                        );

            button.addEventListener(
                "click",
                () => {

                    activeStoreCategory =
                        category;

                    renderStoreFilters();
                    renderStoreProducts();

                }
            );

            filterContainer.appendChild(
                button
            );

        }
    );
}


function renderStoreProducts() {

    const container =
        document.getElementById(
            "storeProducts"
        );

    if (!container) {
        return;
    }

    const filteredProducts =
        activeStoreCategory === "all"
            ? storeProducts
            : storeProducts.filter(
                product =>
                    product.category ===
                    activeStoreCategory
            );

    container.innerHTML = "";

    filteredProducts.forEach(
        product => {

            container.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );

}

async function loadStoreProducts() {

    const container =
        document.getElementById(
            "storeProducts"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <p>
            Loading VELNORA Store...
        </p>
    `;

    try {

        const response =
            await fetch(
                STORE_API
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load store products."
            );
        }

        const files =
            await response.json();

        if (!Array.isArray(files)) {
            throw new Error(
                "Invalid store response."
            );
        }

        const productFiles =
            files.filter(
                file =>
                    file.name.endsWith(".md")
            );

        const productPromises =
            productFiles.map(
                async file => {

                    const productResponse =
                        await fetch(
                            file.download_url
                        );

                    const text =
                        await productResponse.text();

                    return {
                        slug:
                            file.name.replace(
                                ".md",
                                ""
                            ),
                        ...parseFrontMatter(
                            text
                        )
                    };
                }
            );

        const products =
            await Promise.all(
                productPromises
            );

        const visibleProducts =
            products.filter(
                product =>
                    product.status !== "hidden"
            );

        storeProducts =
            visibleProducts;

        if (!visibleProducts.length) {

            container.innerHTML = `
                <p>
                    The VELNORA Store is
                    currently being prepared.
                </p>
            `;

            return;
        }

        renderStoreFilters();
        renderStoreProducts();

    }

    catch (error) {

        console.error(
            "Store Error:",
            error
        );

        container.innerHTML = `
            <p>
                Store products could not
                be loaded right now.
            </p>
        `;
    }
}


loadStoreProducts();
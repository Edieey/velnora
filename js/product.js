const PRODUCTS_API =
    "https://api.github.com/repos/Edieey/velnora/contents/content/store/products";


let currentProduct = null;
let selectedSize = "";
let selectedColour = "";


/* =========================================
   FRONT MATTER PARSER
   ========================================= */

function parseFrontMatter(text) {

    const match =
        text.match(/^---\s*([\s\S]*?)\s*---/);

    if (!match) {
        return {};
    }

    const yaml = match[1];


    function getValue(key) {

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
    }


    function getList(key) {

const match =
    yaml.match(
        new RegExp(
            `^${key}:\\s*([\\s\\S]*?)(?=^[A-Za-z_][\\w-]*\\s*:|^---\\s*$)`,
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
    }


const body =
    text
        .replace(match[0], "")
        .trim();


function getColours() {

    const match =
        yaml.match(
            /^colours:\s*([\s\S]*?)(?=^\w|^---|$)/m
        );

    if (!match) {
        return [];
    }

    const colours = [];

    let currentColour = null;

    match[1]
        .split("\n")
        .forEach(line => {

            const trimmed =
                line.trim();

            if (
                trimmed.startsWith("- name:")
            ) {

                if (currentColour) {
                    colours.push(
                        currentColour
                    );
                }

                currentColour = {
                    name:
                        trimmed
                            .replace(
                                /^-\s*name:\s*/,
                                ""
                            )
                            .replace(
                                /^["']|["']$/g,
                                ""
                            )
                            .trim(),

                    code: ""
                };

            }
            else if (
                trimmed.startsWith("code:")
                &&
                currentColour
            ) {

                currentColour.code =
                    trimmed
                        .replace(
                            /^code:\s*/,
                            ""
                        )
                        .replace(
                            /^["']|["']$/g,
                            ""
                        )
                        .trim();

            }

        });


    if (currentColour) {
        colours.push(
            currentColour
        );
    }


    return colours;
}


return {

    title:
        getValue("title"),

    price:
        getValue("price"),

    image:
        getValue("image"),

    category:
        getValue("category"),

    status:
        getValue("status") ||
        "available",

    buttonText:
        getValue("button_text") ||
        "PURCHASE NOW",

    description:
        body,

    images:
        getList("images"),

    sizes:
        getList("sizes"),

    colours:
        getColours()

};
}


/* =========================================
   GET PRODUCT SLUG
   ========================================= */

function getProductSlug() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("slug");
}


/* =========================================
   LOAD PRODUCT
   ========================================= */

async function loadProduct() {

    const slug =
        getProductSlug();


    const loading =
        document.getElementById(
            "productLoading"
        );

    const error =
        document.getElementById(
            "productError"
        );

    const content =
        document.getElementById(
            "productContent"
        );


    if (!slug) {

        showProductError(
            loading,
            error,
            content
        );

        return;
    }


    try {

        const response =
            await fetch(
                PRODUCTS_API
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load products."
            );
        }


        const files =
            await response.json();


        if (!Array.isArray(files)) {
            throw new Error(
                "Invalid product response."
            );
        }


        const productFile =
            files.find(
                file =>
                    file.name ===
                    `${slug}.md`
            );


        if (!productFile) {
            throw new Error(
                "Product not found."
            );
        }


        const productResponse =
            await fetch(
                productFile.download_url
            );


        if (!productResponse.ok) {
            throw new Error(
                "Product file could not be loaded."
            );
        }


        const text =
            await productResponse.text();


        currentProduct = {
            slug,
            ...parseFrontMatter(text)
        };


        renderProduct(
            currentProduct
        );


        loading.style.display =
            "none";

        content.style.display =
            "grid";

    }

    catch (errorMessage) {

        console.error(
            "Product Error:",
            errorMessage
        );

        showProductError(
            loading,
            error,
            content
        );
    }
}


/* =========================================
   RENDER PRODUCT
   ========================================= */

function renderProduct(product) {

    document.title =
        `VELNORA | ${product.title || "Product"}`;


    const category =
        document.getElementById(
            "productCategory"
        );

    const title =
        document.getElementById(
            "productTitle"
        );

    const price =
        document.getElementById(
            "productPrice"
        );

    const description =
        document.getElementById(
            "productDescription"
        );


    category.textContent =
        formatCategory(
            product.category
        );


    title.textContent =
        product.title ||
        "VELNORA Product";


    price.textContent =
        product.price
            ? `MVR ${product.price}`
            : "";


    if (
        product.description
    ) {

        description.innerHTML =
            marked.parse(
                product.description
            );

    }
    else {

        description.textContent =
            "No description available.";

    }


    renderGallery(
        product
    );


    renderSizes(
        product.sizes
    );


    renderColours(
        product
    );


    setupPurchaseButton(
        product
    );


    if (
        product.status ===
        "sold-out"
    ) {

        disablePurchaseButton();

    }
}


/* =========================================
   CATEGORY
   ========================================= */

function formatCategory(category) {

    if (!category) {
        return "";
    }

    return category
        .replace(/-/g, " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


/* =========================================
   PRODUCT GALLERY
   ========================================= */

function renderGallery(product) {

    const mainImage =
        document.getElementById(
            "productMainImage"
        );

    const thumbnails =
        document.getElementById(
            "productThumbnails"
        );


    const images = [];


    if (product.image) {
        images.push(
            product.image
        );
    }


    if (
        Array.isArray(
            product.images
        )
    ) {

        product.images.forEach(
            image => {

                if (
                    image &&
                    !images.includes(image)
                ) {

                    images.push(
                        image
                    );

                }

            }
        );

    }


    if (!images.length) {

        mainImage.style.display =
            "none";

        thumbnails.innerHTML =
            "";

        return;
    }


    mainImage.src =
        images[0];

    mainImage.alt =
        product.title || "Product";


    thumbnails.innerHTML =
        "";


    images.forEach(
        (image, index) => {

            const thumbnail =
                document.createElement(
                    "img"
                );


            thumbnail.className =
                "product-thumbnail";


            if (index === 0) {
                thumbnail.classList.add(
                    "active"
                );
            }


            thumbnail.src =
                image;

            thumbnail.alt =
                `${product.title || "Product"} ${index + 1}`;


            thumbnail.addEventListener(
                "click",
                () => {

                    mainImage.src =
                        image;


                    document
                        .querySelectorAll(
                            ".product-thumbnail"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    thumbnail.classList.add(
                        "active"
                    );

                }
            );


            thumbnails.appendChild(
                thumbnail
            );

        }
    );
}


/* =========================================
   SIZES
   ========================================= */

function renderSizes(sizes) {

    const section =
        document.getElementById(
            "productSizesSection"
        );

    const container =
        document.getElementById(
            "productSizes"
        );


    if (
        !Array.isArray(sizes) ||
        !sizes.length
    ) {

        section.style.display =
            "none";

        return;
    }


    section.style.display =
        "";


    container.innerHTML =
        "";


    sizes.forEach(
        size => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "product-option";


            button.textContent =
                size;


            button.addEventListener(
                "click",
                () => {

                    selectedSize =
                        size;


                    container
                        .querySelectorAll(
                            ".product-option"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    button.classList.add(
                        "selected"
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );
}


/* =========================================
   COLOURS
   ========================================= */

function renderColours(product) {

    const section =
        document.getElementById(
            "productColoursSection"
        );

    const container =
        document.getElementById(
            "productColours"
        );


    const colours =
        Array.isArray(
            product.colours
        )
            ? product.colours
            : [];


    if (!colours.length) {

        section.style.display =
            "none";

        return;
    }


    section.style.display =
        "";


    container.innerHTML =
        "";


    colours.forEach(
        colour => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "product-colour";


            const swatch =
                document.createElement(
                    "span"
                );


            swatch.className =
                "product-colour-swatch";


            swatch.style.background =
                colour.code ||
                "#777";


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                colour.name ||
                colour.code ||
                "Colour";


            button.appendChild(
                swatch
            );

            button.appendChild(
                name
            );


            button.addEventListener(
                "click",
                () => {

                    selectedColour =
                        colour.name ||
                        colour.code ||
                        "";


                    container
                        .querySelectorAll(
                            ".product-colour"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    button.classList.add(
                        "selected"
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );
}


/* =========================================
   PURCHASE
   ========================================= */

function setupPurchaseButton(product) {

    const button =
        document.getElementById(
            "productPurchaseButton"
        );


    button.textContent =
        product.buttonText ||
        "PURCHASE NOW";


    button.onclick =
        () => {

            const params =
                new URLSearchParams();


            params.set(
                "product",
                product.title || ""
            );


            params.set(
                "slug",
                product.slug || ""
            );


            if (selectedSize) {

                params.set(
                    "size",
                    selectedSize
                );

            }


            if (selectedColour) {

                params.set(
                    "colour",
                    selectedColour
                );

            }


            window.location.href =
                `booking.html?${params.toString()}`;

        };
}


/* =========================================
   SOLD OUT
   ========================================= */

function disablePurchaseButton() {

    const button =
        document.getElementById(
            "productPurchaseButton"
        );


    button.disabled =
        true;


    button.textContent =
        "SOLD OUT";


    button.style.opacity =
        "0.45";


    button.style.cursor =
        "not-allowed";


    button.onclick =
        null;
}


/* =========================================
   ERROR
   ========================================= */

function showProductError(
    loading,
    error,
    content
) {

    if (loading) {
        loading.style.display =
            "none";
    }


    if (content) {
        content.style.display =
            "none";
    }


    if (error) {

        error.style.display =
            "block";

    }
}


/* =========================================
   START
   ========================================= */

loadProduct();
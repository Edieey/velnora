/* =========================================
   VELNORA PURCHASE PAGE
   ========================================= */

const STORE_PRODUCTS_API =
    "https://api.github.com/repos/Edieey/velnora/contents/content/store/products";

const STORE_SETTINGS_URL =
    "content/store/settings.md";


/* =========================================
   STATE
   ========================================= */

let purchaseProduct = null;
let purchaseSettings = null;

let selectedSize = "";
let selectedColour = "";
let quantity = 1;


/* =========================================
   URL
   ========================================= */

function getProductSlug() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("slug") ||
        ""
    ).trim();

}


/* =========================================
   FRONT MATTER
   ========================================= */

function parseFrontMatter(text) {

    const match =
        text.match(
            /^---\s*([\s\S]*?)\s*---/
        );

    if (!match) {
        return {};
    }

    const yaml =
        match[1];


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
            .replace(
                /^["']|["']$/g,
                ""
            )
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
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line.startsWith("-")
            )
            .map(
                line =>
                    line
                        .replace(
                            /^-\s*/,
                            ""
                        )
                        .replace(
                            /^["']|["']$/g,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);

    };


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
            "PROCESS PURCHASE",

        images:
            getList("images"),

        sizes:
            getList("sizes")

    };

}

function parseStoreSettings(text) {

    const settings = {};

    const match =
        text.match(
            /^---\s*([\s\S]*?)\s*---/
        );

    if (!match) {
        return settings;
    }

    const lines =
        match[1].split(/\r?\n/);

    let currentObject = null;

    for (const line of lines) {

        if (!line.trim() || line.trim().startsWith("#")) {
            continue;
        }


        /*
         * Nested values
         *
         * Example:
         *
         * mvr_payment:
         *   bank_name: "BML"
         *   account_name: "SHAIHAN KHAALID"
         *   account_number: "123456"
         */

        const nestedMatch =
            line.match(
                /^\s{2,}([A-Za-z0-9_-]+):\s*(.*)$/
            );


        if (nestedMatch && currentObject) {

            const key =
                nestedMatch[1];

            let value =
                nestedMatch[2].trim();


            if (
                value.startsWith('"') &&
                value.endsWith('"')
            ) {

                try {

                    value =
                        JSON.parse(value);

                } catch {

                    value =
                        value.slice(1, -1);

                }

            }


            settings[currentObject][key] =
                value;

            continue;
        }


        /*
         * Top-level values
         */

        const topLevelMatch =
            line.match(
                /^([A-Za-z0-9_-]+):\s*(.*)$/
            );


        if (!topLevelMatch) {
            continue;
        }


        const key =
            topLevelMatch[1];

        let value =
            topLevelMatch[2].trim();


        /*
         * Empty value means this is
         * the beginning of a nested object.
         */

        if (value === "") {

            settings[key] = {};

            currentObject = key;

            continue;
        }


        /*
         * Normal quoted value
         */

        if (
            value.startsWith('"') &&
            value.endsWith('"')
        ) {

            try {

                value =
                    JSON.parse(value);

            } catch {

                value =
                    value.slice(1, -1);

            }

        }


        settings[key] =
            value;


        /*
         * This is no longer a nested object.
         */

        currentObject = null;

    }


    return settings;

}

/* =========================================
   LOAD STORE SETTINGS
   ========================================= */

async function loadStoreSettings() {

    const response =
        await fetch(
            STORE_SETTINGS_URL
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load store settings."
        );

    }


    const text =
        await response.text();


    purchaseSettings =
        parseStoreSettings(
            text
        );


    return purchaseSettings;

}
/* =========================================
   LOAD PRODUCT
   ========================================= */

async function loadPurchaseProduct() {

    const slug =
        getProductSlug();

    if (!slug) {

        throw new Error(
            "No product was specified."
        );

    }


    const response =
        await fetch(
            STORE_PRODUCTS_API
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load products."
        );

    }


    const files =
        await response.json();


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
            "Unable to load product."
        );

    }


    const text =
        await productResponse.text();


    purchaseProduct = {

        slug,

        ...parsePurchaseProduct(
            text
        )

    };


    return purchaseProduct;

}
/* =========================================
   PRODUCT FRONT MATTER PARSER
   ========================================= */

function parsePurchaseProduct(text) {

    const match =
        text.match(
            /^---\s*([\s\S]*?)\s*---/
        );


    if (!match) {
        return {};
    }


    const yaml =
        match[1];


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
            .replace(
                /^["']|["']$/g,
                ""
            )
            .trim();

    };


    const getList = (key) => {

        const match =
            yaml.match(
                new RegExp(
                    `^${key}:\\s*\\n([\\s\\S]*?)(?=^[A-Za-z_][\\w-]*:\\s|^---\\s*$)`,
                    "m"
                )
            );


        if (!match) {
            return [];
        }


        return match[1]
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line.startsWith("-")
            )
            .map(
                line =>
                    line
                        .replace(
                            /^-\s*/,
                            ""
                        )
                        .replace(
                            /^["']|["']$/g,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);

    };


    const getColours = (key) => {

        const match =
            yaml.match(
                new RegExp(
                    `^${key}:\\s*\\n([\\s\\S]*?)(?=^[A-Za-z_][\\w-]*:\\s|^---\\s*$)`,
                    "m"
                )
            );


        if (!match) {
            return [];
        }


        const lines =
            match[1]
                .split("\n")
                .map(
                    line =>
                        line.trim()
                );


        const colours = [];

        let currentColour = null;


        lines.forEach(
            line => {

                if (
                    line.startsWith("- ")
                ) {

                    if (currentColour) {

                        colours.push(
                            currentColour
                        );

                    }


                    currentColour = {

                        name:
                            line
                                .replace(
                                    /^-\s*/,
                                    ""
                                )
                                .trim(),

                        code: ""

                    };

                    return;

                }


                const nameMatch =
                    line.match(
                        /^name:\s*(.*)$/
                    );


                if (
                    nameMatch &&
                    currentColour
                ) {

                    currentColour.name =
                        nameMatch[1]
                            .replace(
                                /^["']|["']$/g,
                                ""
                            )
                            .trim();

                    return;

                }


                const codeMatch =
                    line.match(
                        /^code:\s*(.*)$/
                    );


                if (
                    codeMatch &&
                    currentColour
                ) {

                    currentColour.code =
                        codeMatch[1]
                            .replace(
                                /^["']|["']$/g,
                                ""
                            )
                            .trim();

                }

            }
        );


        if (currentColour) {

            colours.push(
                currentColour
            );

        }


        return colours;

    };


    const body =
        text
            .replace(
                /^---\s*[\s\S]*?\s*---/,
                ""
            )
            .trim();


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

        images:
            getList("images"),

sizes:
    getList("sizes"),

colours:
    getColours("colours"),

description:
    body

    };

}
/* =========================================
   HELPERS
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
   PRODUCT IMAGE
   ========================================= */

function getPurchaseProductImage(product) {

    if (product.image) {
        return product.image;
    }

    if (
        Array.isArray(product.images) &&
        product.images.length
    ) {
        return product.images[0];
    }

    return "";

}


/* =========================================
   RENDER PRODUCT SUMMARY
   ========================================= */

function renderPurchaseProduct(product) {

    const image =
        document.getElementById(
            "purchaseProductImage"
        );

    const category =
        document.getElementById(
            "purchaseProductCategory"
        );

    const title =
        document.getElementById(
            "purchaseProductTitle"
        );

    const price =
        document.getElementById(
            "purchaseProductPrice"
        );


    const productImage =
        getPurchaseProductImage(
            product
        );


    if (productImage) {

        image.src =
            productImage;

        image.alt =
            product.title ||
            "VELNORA Product";

        image.style.display =
            "";

    }
    else {

        image.style.display =
            "none";

    }


    category.textContent =
        formatCategory(
            product.category
        );


    title.textContent =
        product.title ||
        "VELNORA Product";


const priceParts = [];

if (product.price) {
    priceParts.push(`MVR ${product.price}`);
}

if (product.priceUsd) {
    priceParts.push(`USD ${product.priceUsd}`);
}

price.textContent =
    priceParts.join(" / ");


    document.title =
        `VELNORA | Purchase | ${
            product.title ||
            "Product"
        }`;

}


function renderPurchaseSizes(product) {

    const summary =
        document.getElementById(
            "purchaseSelectedSize"
        );

    const sizes =
        Array.isArray(
            product.sizes
        )
            ? product.sizes
            : [];


    if (!sizes.length) {

        selectedSize = "";

        summary.textContent =
            "Not applicable";

        return;

    }


    selectedSize =
        sizes[0];

    summary.textContent =
        selectedSize;


    const form =
        document.getElementById(
            "purchaseForm"
        );

    if (!form) {
        return;
    }


    const existing =
        document.getElementById(
            "purchaseSizeOptions"
        );

    if (existing) {
        existing.remove();
    }


    const section =
        document.createElement(
            "div"
        );

    section.id =
        "purchaseSizeOptions";

    section.className =
        "purchase-option-group";


    const label =
        document.createElement(
            "label"
        );

    label.textContent =
        "SIZE";

    label.className =
        "purchase-option-label";


    const options =
        document.createElement(
            "div"
        );

    options.className =
        "purchase-options";


    sizes.forEach(
        size => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "purchase-option";

            button.textContent =
                size;


            if (
                size ===
                selectedSize
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    selectedSize =
                        size;

                    summary.textContent =
                        selectedSize;


                    options
                        .querySelectorAll(
                            ".purchase-option"
                        )
                        .forEach(
                            option => {

                                option.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );

                }
            );


            options.appendChild(
                button
            );

        }
    );


    section.appendChild(
        label
    );

    section.appendChild(
        options
    );


    form.insertBefore(
        section,
        form.firstElementChild
    );

}
/* =========================================
   COLOUR OPTIONS
   ========================================= */

function renderPurchaseColours(product) {

    const summary =
        document.getElementById(
            "purchaseSelectedColour"
        );


    const colours =
        Array.isArray(
            product.colours
        )
            ? product.colours
            : [];


    if (!colours.length) {

        selectedColour = "";

        summary.textContent =
            "Not applicable";

        return;

    }


    const firstColour =
        colours[0];


    selectedColour =
        firstColour.name ||
        firstColour.code ||
        "";


    summary.textContent =
        selectedColour;

}


/* =========================================
   QUANTITY
   ========================================= */

function setupPurchaseQuantity() {

    const minus =
        document.getElementById(
            "quantityMinus"
        );

    const plus =
        document.getElementById(
            "quantityPlus"
        );

    const input =
        document.getElementById(
            "purchaseQuantity"
        );

    const summary =
        document.getElementById(
            "purchaseSelectedQuantity"
        );


    function updateQuantity() {

        input.value =
            quantity;

        summary.textContent =
            quantity;

    }


    minus.addEventListener(
        "click",
        () => {

            if (quantity <= 1) {
                return;
            }

            quantity--;

            updateQuantity();

        }
    );


    plus.addEventListener(
        "click",
        () => {

            quantity++;

            updateQuantity();

        }
    );


    updateQuantity();

}
/* =========================================
   RENDER STORE PAYMENT SETTINGS
   ========================================= */

function renderPurchaseSettings(settings) {

    const mvrPayment =
        settings.mvr_payment || {};

    const usdPayment =
        settings.usd_payment || {};

    const mvrBankName =
        document.getElementById(
            "mvrPaymentBankName"
        );

    const mvrAccountName =
        document.getElementById(
            "mvrPaymentAccountName"
        );

    const mvrAccountNumber =
        document.getElementById(
            "mvrPaymentAccountNumber"
        );

    const usdBankName =
        document.getElementById(
            "usdPaymentBankName"
        );

    const usdAccountName =
        document.getElementById(
            "usdPaymentAccountName"
        );

    const usdAccountNumber =
        document.getElementById(
            "usdPaymentAccountNumber"
        );

    const instructions =
        document.getElementById(
            "paymentInstructions"
        );


    mvrBankName.textContent =
        mvrPayment.bank_name || "";

    mvrAccountName.textContent =
        mvrPayment.account_name || "";

    mvrAccountNumber.textContent =
        mvrPayment.account_number || "";


    usdBankName.textContent =
        usdPayment.bank_name || "";

    usdAccountName.textContent =
        usdPayment.account_name || "";

    usdAccountNumber.textContent =
        usdPayment.account_number || "";


    instructions.textContent =
        settings.payment_instructions || "";

}
/* =========================================
   PURCHASE PAGE INITIALIZATION
   ========================================= */

async function initializePurchasePage() {

    try {

        const [
            product,
            settings
        ] =
            await Promise.all([
                loadPurchaseProduct(),
                loadStoreSettings()
            ]);


        renderPurchaseProduct(
            product
        );


        renderPurchaseSizes(
            product
        );


        renderPurchaseColours(
            product
        );


renderPurchaseSettings(
    settings
);


setupPurchaseQuantity();


        const loading =
            document.getElementById(
                "purchaseLoading"
            );

        const content =
            document.getElementById(
                "purchaseContent"
            );


        loading.style.display =
            "none";

        content.style.display =
            "";

    }

    catch (error) {

        console.error(
            "Purchase Page Error:",
            error
        );


        const loading =
            document.getElementById(
                "purchaseLoading"
            );

        const errorElement =
            document.getElementById(
                "purchaseError"
            );


        loading.style.display =
            "none";


        errorElement.textContent =
            error.message ||
            "Unable to load the purchase page.";


        errorElement.style.display =
            "";

    }

}


initializePurchasePage();
/* =========================================
   PURCHASE FORM SUBMISSION
   ========================================= */

function setupPurchaseForm() {

    const form =
        document.getElementById(
            "purchaseForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const button =
                document.getElementById(
                    "purchaseSubmitButton"
                );


            const message =
                document.getElementById(
                    "purchaseFormMessage"
                );


            const name =
                document.getElementById(
                    "customerName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "customerPhone"
                ).value.trim();


            const email =
                document.getElementById(
                    "customerEmail"
                ).value.trim();


            const address =
                document.getElementById(
                    "deliveryAddress"
                ).value.trim();


            const paymentConfirmed =
                document.getElementById(
                    "paymentConfirmed"
                ).checked;


            const quantityInput =
                document.getElementById(
                    "purchaseQuantity"
                );


            const orderQuantity =
                Number(
                    quantityInput.value
                );


            // =========================================
            // VALIDATION
            // =========================================

            if (!name) {

                message.textContent =
                    "Please enter your full name.";

                message.style.display =
                    "";

                return;

            }


            if (!phone) {

                message.textContent =
                    "Please enter your phone number.";

                message.style.display =
                    "";

                return;

            }


            if (!address) {

                message.textContent =
                    "Please enter your delivery address.";

                message.style.display =
                    "";

                return;

            }


            if (!paymentConfirmed) {

                message.textContent =
                    "Please confirm that the payment instructions are understood and the order details are correct.";

                message.style.display =
                    "";

                return;

            }


            if (
                !Number.isInteger(
                    orderQuantity
                ) ||
                orderQuantity < 1
            ) {

                message.textContent =
                    "Please select a valid quantity.";

                message.style.display =
                    "";

                return;

            }


            if (!purchaseProduct) {

                message.textContent =
                    "Product information is not available. Please reload the page and try again.";

                message.style.display =
                    "";

                return;

            }


            // =========================================
            // PREPARE ORDER
            // =========================================

            const orderData = {

                product:
                    purchaseProduct.title ||
                    "VELNORA Product",

                price:
                    purchaseProduct.price ||
                    "",

                size:
                    selectedSize ||
                    "",

                colour:
                    selectedColour ||
                    "",

                quantity:
                    orderQuantity,

                customerName:
                    name,

                customerPhone:
                    phone,

                customerEmail:
                    email,

                deliveryAddress:
                    address,

                paymentConfirmed:
                    true

            };


            // =========================================
            // DISABLE BUTTON
            // =========================================

            button.disabled =
                true;

            button.textContent =
                "PROCESSING...";


            message.style.display =
                "";

            message.textContent =
                "Submitting your order...";


            // =========================================
            // SEND TO NETLIFY FUNCTION
            // =========================================

            try {

                const response =
                    await fetch(
                        "/.netlify/functions/send-order",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )

                        }
                    );


                let result = {};

                try {

                    result =
                        await response.json();

                } catch (parseError) {

                    result = {};

                }


                // =====================================
                // SERVER ERROR
                // =====================================

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to submit your order."
                    );

                }


                // =====================================
                // SUCCESS
                // =====================================

                message.textContent =
                    "Your order has been submitted successfully. We will contact you shortly.";

                message.style.display =
                    "";


                button.textContent =
                    "ORDER SUBMITTED";


                // Prevent accidental duplicate submissions
                button.disabled =
                    true;


                console.log(
                    "VELNORA order submitted successfully:",
                    result
                );


            } catch (error) {

                console.error(
                    "Purchase submission error:",
                    error
                );


                message.textContent =
                    error.message ||
                    "Something went wrong while submitting your order. Please try again.";

                message.style.display =
                    "";


                button.disabled =
                    false;

                button.textContent =
                    purchaseProduct.buttonText ||
                    "PROCESS PURCHASE";

            }

        }
    );

}


setupPurchaseForm();
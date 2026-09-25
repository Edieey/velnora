const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    try {

        // =========================================
        // CORS PREFLIGHT
        // =========================================

        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 204,
                headers,
                body: ""
            };
        }


        // =========================================
        // ONLY POST
        // =========================================

        if (event.httpMethod !== "POST") {

            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: "Method not allowed."
                })
            };

        }


        // =========================================
        // ZOHO CREDENTIALS
        // =========================================

        const zohoEmail =
            process.env.ZOHO_EMAIL;

        const zohoPassword =
            process.env.ZOHO_APP_PASSWORD;


        if (!zohoEmail || !zohoPassword) {

            console.error(
                "Zoho environment variables are missing."
            );

            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Zoho email configuration is missing."
                })
            };

        }


        // =========================================
        // PARSE REQUEST
        // =========================================

        let data = {};

        try {

            data =
                JSON.parse(
                    event.body || "{}"
                );

        } catch (error) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Invalid request body."
                })
            };

        }


        // =========================================
        // ORDER DATA
        // =========================================

        const product =
            String(
                data.product || ""
            ).trim();

        const price =
            String(
                data.price || ""
            ).trim();
        const priceUsd =
            String(
                data.priceUsd || ""
            ).trim();
        const tshirtType =
            String(
                data.tshirtType || ""
            ).trim();
        const size =
            String(
                data.size || ""
            ).trim();

        const colour =
            String(
                data.colour || ""
            ).trim();

        const quantity =
            Number(
                data.quantity || 1
            );

        const customerName =
            String(
                data.customerName || ""
            ).trim();

        const customerPhone =
            String(
                data.customerPhone || ""
            ).trim();

        const customerEmail =
            String(
                data.customerEmail || ""
            ).trim();

        const deliveryAddress =
            String(
                data.deliveryAddress || ""
            ).trim();

        const paymentConfirmed =
            data.paymentConfirmed === true;
                const paymentSlip =
            data.paymentSlip || null;

        const paymentSlipFileName =
            String(
                paymentSlip?.fileName || ""
            ).trim();

        const paymentSlipContentType =
            String(
                paymentSlip?.contentType || ""
            ).trim();

        const paymentSlipContent =
            String(
                paymentSlip?.content || ""
            ).trim();


        // =========================================
        // VALIDATION
        // =========================================

        if (!product) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Product information is missing."
                })
            };

        }


        if (!customerName) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Customer name is required."
                })
            };

        }


        if (!customerPhone) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Customer phone number is required."
                })
            };

        }


        if (!deliveryAddress) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Delivery address is required."
                })
            };

        }


        if (!paymentConfirmed) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Payment confirmation is required."
                })
            };

        }

        if (
    !paymentSlipFileName ||
    !paymentSlipContentType ||
    !paymentSlipContent
) {

    return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
            success: false,
            message:
                "Payment slip attachment is required."
        })
    };

}

        if (
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message:
                        "Invalid quantity."
                })
            };

        }


        // =========================================
        // CALCULATE TOTAL
        // =========================================

        const numericPriceMvr =
            Number(
                String(price)
                    .replace(
                        /[^0-9.]/g,
                        ""
                    )
            );

        const numericPriceUsd =
            Number(
                String(priceUsd)
                    .replace(
                        /[^0-9.]/g,
                        ""
                    )
            );

        const totalMvr =
            Number.isFinite(numericPriceMvr)
                ? numericPriceMvr * quantity
                : null;

        const totalUsd =
            Number.isFinite(numericPriceUsd)
                ? numericPriceUsd * quantity
                : null;

        const formattedTotalMvr =
            totalMvr !== null
                ? `MVR ${totalMvr.toFixed(2)}`
                : "Not specified";

        const formattedTotalUsd =
            totalUsd !== null
                ? `USD ${totalUsd.toFixed(2)}`
                : "Not specified";


        // =========================================
        // SMTP
        // =========================================

        const transporter =
            nodemailer.createTransport({

                host:
                    "smtppro.zoho.com",

                port:
                    465,

                secure:
                    true,

                auth: {

                    user:
                        zohoEmail,

                    pass:
                        zohoPassword

                }

            });


        // =========================================
        // VERIFY SMTP
        // =========================================

        await transporter.verify();


        // =========================================
        // EMAIL SUBJECT
        // =========================================

        const subject =
            `VELNORA Store — New Order — ${product}`;


        // =========================================
        // EMAIL TEXT
        // =========================================

        const text = [

            "VELNORA STORE — NEW ORDER",

            "",

            "PRODUCT",
            "────────────────────────",
            `Product: ${product}`,
            `MVR Price: ${
                price
                    ? `MVR ${price}`
                    : "Not specified"
            }`,
            `USD Price: ${
                priceUsd
                    ? `USD ${priceUsd}`
                    : "Not specified"
            }`,
            `T-Shirt Type: ${
                tshirtType
                    ? (
                        tshirtType === "drop-shoulder"
                            ? "Drop Shoulder"
                            : "Normal"
                    )
                    : "Not specified"
            }`,
            `Size: ${
                size || "Not applicable"
            }`,
            `Colour: ${
                colour || "Not applicable"
            }`,
            `Quantity: ${quantity}`,
            `Total MVR: ${formattedTotalMvr}`,
            `Total USD: ${formattedTotalUsd}`,

            "",

            "CUSTOMER",
            "────────────────────────",
            `Name: ${customerName}`,
            `Phone / WhatsApp: ${customerPhone}`,
            `Email: ${
                customerEmail || "Not provided"
            }`,

            "",

            "DELIVERY",
            "────────────────────────",
            deliveryAddress,

            "",

            "PAYMENT",
            "────────────────────────",
            "Payment instructions confirmed: YES",

            "",

            "This order was submitted through",
            "the VELNORA Store."

        ].join("\n");


        // =========================================
        // SEND EMAIL
        // =========================================

const mailOptions = {

    from:
        `"VELNORA Store" <${zohoEmail}>`,

    to:
        zohoEmail,

    subject,

    text,

    attachments: [
        {
            filename:
                paymentSlipFileName,

            content:
                Buffer.from(
                    paymentSlipContent,
                    "base64"
                ),

            contentType:
                paymentSlipContentType
        }
    ]

};


        // Reply directly to customer if email exists
        if (customerEmail) {

            mailOptions.replyTo =
                customerEmail;

        }


        const info =
            await transporter.sendMail(
                mailOptions
            );


        console.log(
            "VELNORA order email sent:",
            info.messageId
        );


        // =========================================
        // SUCCESS
        // =========================================

        return {

            statusCode: 200,

            headers,

            body:
                JSON.stringify({

                    success:
                        true,

                    message:
                        "Your order has been submitted successfully.",

                    messageId:
                        info.messageId

                })

        };

    } catch (error) {

        console.error(
            "Order email function error:",
            error
        );


        return {

            statusCode: 500,

            headers,

            body:
                JSON.stringify({

                    success:
                        false,

                    message:
                        "Unable to process your order.",

                    error:
                        error.message

                })

        };

    }
};
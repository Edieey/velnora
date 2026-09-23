const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    try {
        // Only allow POST requests
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Method not allowed."
                })
            };
        }

        // Check that the Zoho credentials exist
        const zohoEmail = process.env.ZOHO_EMAIL;
        const zohoPassword = process.env.ZOHO_APP_PASSWORD;

        if (!zohoEmail || !zohoPassword) {
            console.error("Zoho environment variables are missing.");

            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Zoho email configuration is missing."
                })
            };
        }

        // Parse request body
        let data = {};

        try {
            data = JSON.parse(event.body || "{}");
        } catch (error) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Invalid request body."
                })
            };
        }

        // TEST MODE ONLY
        // The recipient is intentionally fixed to the Zoho mailbox.
        if (data.test !== true) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "This endpoint is currently in test mode."
                })
            };
        }

        // Zoho SMTP configuration
        const transporter = nodemailer.createTransport({
            host: "smtppro.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: zohoEmail,
                pass: zohoPassword
            }
        });

        // Verify the SMTP connection first
        await transporter.verify();

        // Send the test email to the Zoho mailbox itself
        const info = await transporter.sendMail({
            from: `"VELNORA Store" <${zohoEmail}>`,
            to: zohoEmail,
            subject: "VELNORA Store — Email System Test",
            text: [
                "VELNORA Store email system test.",
                "",
                "This email confirms that the Netlify Function can successfully connect to Zoho SMTP.",
                "",
                "Sender:",
                zohoEmail,
                "",
                "SMTP:",
                "smtppro.zoho.com:465 SSL",
                "",
                "The VELNORA purchase system is not connected yet."
            ].join("\n")
        });

        console.log("Test email sent:", info.messageId);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                message: "Test email sent successfully."
            })
        };

    } catch (error) {
        console.error("Email function error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Unable to send test email.",
                error: error.message
            })
        };
    }
};

const nodemailer = require("nodemailer");
require("dotenv").config();

const mailsender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `GRAMS - Grievance Management <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("Email sent successfully:", info.messageId);
        return info;

    } catch (error) {
        console.log("Error while sending mail:", error);
        return false;
    }
};

module.exports = mailsender;

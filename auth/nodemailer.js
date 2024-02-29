const nodemailer = require('nodemailer');
require("dotenv").config();

// create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USERMAIL,
        pass: process.env.USERSECRET
    }
});

// Function to send email
function sendMail(mailFeature) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailFeature, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}

module.exports = { sendMail };

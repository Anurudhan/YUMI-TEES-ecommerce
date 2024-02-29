const nodemailer = require("nodemailer")
require("dotenv").config();

async function sendResetEmail(recipientEmail,link) {

    // Create a nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., 'gmail'
        auth: {
            user: process.env.USERMAIL,
            pass: process.env.USERSECRET
        }
    });

    transporter.verify((err, success) => {
        if (err) {
            console.log(err)
        } else {
            console.log("mail is ok ")
        }
    });

    // Define email options
    let mailOptions = {
        from: process.env.USERMAIL,
        to: recipientEmail,
        subject: 'Your Yumi Tees password reset ',
        text: `Your Password Reset link  is :  \n \n ${link} \n \n click on this link to reset the password` 
    };


    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}: ${info.messageId}`);
}
module.exports = {sendResetEmail}
const OTP=require("../model/otpmodel")
const {generateOTP}=require("./generatorotp")
const { sendMail }=require("../auth/nodemailer")
require("dotenv").config();

async function sendOTP(email){
    let otp = generateOTP()
    console.log("your otp is "+otp);
    await OTP.findOneAndUpdate(
        {email:email},
        {$set:{otp:otp}},
        {upsert:true}
    )
    const mailfeature = {
        from:process.env.USERMAIL,
        to:email,
        subject:"OTP verification",
        text:`your otp is ${otp}`
    }
    const mailresponse = await sendMail(mailfeature)
    return {
        mailresponse,
        otp
    } 
}
module.exports={sendOTP}
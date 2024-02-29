const mongoose = require('mongoose');
const otpschema=new mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    otp:{
        type:String
    }
},{
    timestamps:true
})
const OTP=mongoose.model("OTP",otpschema)
module.exports=OTP
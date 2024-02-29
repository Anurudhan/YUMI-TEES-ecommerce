const mongoose = require('mongoose');
const userschema= new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    status:{
        type:Number,
    }
},
{
    timestamps:true,
}
)
const Users=mongoose.model("user",userschema)
module.exports=Users
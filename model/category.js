const mongoose = require('mongoose');
const { schema } = require('./otpmodel');
const Schema= mongoose.Schema;

const categorySchema=new Schema({
    categoryname:{
        type:String,
    },
})
const category=mongoose.model("category",categorySchema);
module.exports=category;
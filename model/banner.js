const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    bannername:{
        type:String,
    },
    bannerimage:{
        type:String,
        required:true,
    }
})
module.exports = mongoose.model('banner',bannerSchema);
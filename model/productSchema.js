const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    Description: {
        type: String,
    },
    images: {
        type: Array,
        required: true,
    },

    stockQuantity: {
        type: Number,
        required: true,
    },

    Category: {
        type: mongoose.Schema.Types.ObjectId,ref:'category', 
        required: true,
    },

    discountAmount: {
        type: Number,
    },

    status: {
        type: String,
    },

    Specification1: {
        type: String,
    },

    Specification2: {
        type: String,
    },
    Specification3: {
        type: String,
    },

    Specification4: {
        type: String,
    },
    displayStatus : {
        type: String,
        default :"Show"
    },
    
    tags : {
        type : String
    },
    inCategoryOffer : {
        type: Boolean,
        default: false
    },
    beforeOffer : {
        type: Number
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model('product', productSchema)
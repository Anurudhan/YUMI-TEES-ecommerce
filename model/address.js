const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId
    },
    name:{
        type:String
    },
    mobile: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    pincode: {
        type: String
    },
    locality: {
        type: String
    },
    city: {
        type: String
    },
    district: {
        type: String
    },
    state: {
        type: String
    },
    addressType: {
        type: String
    }
})

const address = mongoose.model("addres",addressSchema);

module.exports = address;
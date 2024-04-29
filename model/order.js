const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderid: {type:String},
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' 
    },
    products:[
        {
            productid: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number },
            status: { type: String, default: "Processed" },
            price: { type: Number }
        }
    ],
    address:{
        name: String,
        address: String,
        locality: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
        mobile:Number
    },
    orderdate:{
        type: Date,
        required: true,
    },
    expectedDeliveryDate: Date,
    paymentMethod: String,
    PaymentStatus: String,
    totalAmount: Number,
    deliveryDate: Date,
    deliverycharge: {type : Number, default : 0},
    rejectedDate: Date,
    rejectdetails:String,
    orderStatus: String,
    couponDiscount: Number,
    couponCode: String,
    discountAmount: Number,
})

const order = mongoose.model("order",orderSchema);

module.exports = order
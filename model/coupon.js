const mongoose = require('mongoose');
const Schema = mongoose.Schema

const couponSchema = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
      },
    couponCode: String,
    description: String,
    minimumPurchaseAmount: Number,
    discountAmount: Number,
    validFrom : Date,
    validTo: Date,
    status: {
        type:String,
        default : "Active"
    }
})

const coupon = mongoose.model("coupon",couponSchema);

module.exports = coupon;
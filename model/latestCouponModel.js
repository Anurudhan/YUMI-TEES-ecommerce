const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,

  minimumPurchaseAmount: {
    type: Number,
    required: true,
  },

  discountType: {
    type: String,
    enum: ["Flat", "Percentage"],
    default: "Flat"
  },
  discountValue: {
    type: Number,
    required: true
  },

  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },

  usageLimit: { type: Number, default: 0 },   // total times coupon can be used (0 = unlimited)
  usedCount: { type: Number, default: 0 },    // how many times used overall
  perUserLimit: { type: Number, default: 1 }, // times a single user can use

  usedBy: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "user" },
      count: { type: Number, default: 1 } 
    }
  ],

  status: {
    type: String,
    enum: ["Active", "Expired", "Inactive","Delete","Upcoming"],
    default: "Active"
  }
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;

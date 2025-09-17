const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    // Products in this order
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
            name: String,   // snapshot
            price: Number,  // snapshot (base price at order time)
            discountAmount: Number, // snapshot if product had discount
            quantity: { type: Number, required: true },
            status: {
                type: String,
                enum: ["Pending", "Processed", "Shipped", "Delivered", "Cancelled", "Returned"],
                default: "Pending"
            }
        }
    ],

    // Address used for this order (snapshot of saved address)
    address: {
        addressId: { type: mongoose.Schema.Types.ObjectId, ref: "address" },
        name: String,
        mobile: String,
        address: String,
        city: String,
        district: String,
        state: String,
        pincode: String
    },

    // Coupon applied (if any)
    coupon: {
        couponId: { type: mongoose.Schema.Types.ObjectId, ref: "coupon" },
        code: String,
        discountAmount: { type: Number, default: 0 }
    },

    // Payment Info
    payment: {
        method: { type: String, enum: ["COD", "Card", "UPI", "NetBanking"] },
        status: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
        transactionId: String
    },

    // Charges
    charges: {
        delivery: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true }, // before discount
        discountAmount: { type: Number, default: 0 }, // coupon/offer
        finalAmount: { type: Number, required: true } // after discount + charges
    },

    // Timeline
    timeline: {
        placedAt: { type: Date, default: Date.now },
        expectedDelivery: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        returnedAt: Date
    },

    orderStatus: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
        default: "Pending"
    }
}, { timestamps: true });

const Order = mongoose.model("order", orderSchema);

module.exports = Order;

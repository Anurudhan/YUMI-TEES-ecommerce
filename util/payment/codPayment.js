const Cart = require("../../model/cartmodel");
const Order = require('../../model/order');
const product = require("../../model/productSchema");
const Coupon = require("../../model/coupon");

const processCOD = async ({ finalAmount , couponId }) => {
    if (finalAmount > 1000) throw new AppError("Order above ₹1000 not allowed for Cash On Delivery", 400);

    await Order.create({
        ...commonOrderData,
        payment: { method: "COD", status: "Pending" }
    });

    for (const item of cart.products) {
        await product.updateOne(
            { _id: item.productid },
            { $inc: { stockQuantity: -item.quantity } }
        );
    }

    await Cart.findByIdAndDelete(cart._id);

    if (couponId) {
        const coupon = await Coupon.findById(couponId);
        const userUsage = coupon.usedBy.find(u => u.userId.toString() === user._id.toString());

        if (userUsage) {
            // Increment user's count if already exists
            await Coupon.updateOne(
                { _id: couponId, "usedBy.userId": user._id },
                {
                    $inc: { "usedBy.$.count": 1, usedCount: 1 }
                }
            );
        } else {
            // Push new user into usedBy array and increment usedCount
            await Coupon.updateOne(
                { _id: couponId },
                {
                    $push: { usedBy: { userId: user._id, count: 1 } },
                    $inc: { usedCount: 1 }
                }
            );
        }
    }

    return { paymentMethod: "COD", message: "Order placed with Cash on Delivery" };
};

module.exports = processCOD;

const Coupon = require("../model/latestCouponModel");
const AppError = require("./AppError");


async function validateCoupon(couponCode, userId) {
    if (!couponCode) {
        return { couponId: null, coupon: null };
    }

    const coupon = await Coupon.findOne({ couponCode });
    if (!coupon) throw new AppError("Coupon not found", 404);
    if (coupon.status !== "Active") throw new AppError("Coupon is not active", 400);

    const now = new Date();
    if (now < coupon.validFrom) throw new AppError("Coupon is not yet valid", 400);
    if (now > coupon.validTo) throw new AppError("Coupon has expired", 400);

    const userUsage = coupon.usedBy.find(u => u.userId.toString() === userId.toString());
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
        throw new AppError("You have already used this coupon maximum times", 409);
    }

    return { couponId: coupon._id, coupon };
}

function calculateCouponDiscount(coupon, totalAmount, productDiscount = 0) {
    const eligibleAmount = totalAmount - productDiscount;

    if (eligibleAmount < coupon.minimumPurchaseAmount) {
        throw new AppError(
            `Minimum purchase of ₹${coupon.minimumPurchaseAmount} required`,
            400
        );
    }

    const validCouponDiscount =
        coupon.discountType === "Flat"
            ? coupon.discountValue
            : Math.floor((eligibleAmount * coupon.discountValue) / 100);

    return validCouponDiscount;
}

module.exports = { validateCoupon, calculateCouponDiscount };

function validateCouponData({ couponCode, description, minimumPurchaseAmount, discountType, discountValue, validFrom, validTo }) {

    // Coupon Code
    if (!couponCode || couponCode.trim().length === 0) {
        return "Coupon code is required.";
    }

    // Description
    if (!description || description.trim().length < 4) {
        return "Description must be at least 4 characters long.";
    }

    // Minimum Purchase
    if (!minimumPurchaseAmount || minimumPurchaseAmount < 500) {
        return "Minimum purchase amount must be at least ₹500.";
    }

    // Discount Type
    if (!discountType || !["Flat", "Percentage"].includes(discountType)) {
        return "Invalid discount type. Must be Flat or Percentage.";
    }

    // Discount Value
    if (!discountValue || discountValue <= 0) {
        return "Discount value must be greater than 0.";
    } 
    if (discountType === "Percentage" && discountValue > 30) {
        return "Percentage discount cannot exceed 30%.";
    } 
    if (discountType === "Flat") {
        const maxDiscount = 0.3 * minimumPurchaseAmount;
        if (discountValue > maxDiscount) {
            return `Flat discount cannot exceed 30% of minimum purchase (₹${maxDiscount.toFixed(2)}).`;
        }
    }

    // Dates
    const today = new Date();
    if (new Date(validFrom) < today.setHours(0, 0, 0, 0)) {
        return "Start date must be today or in the future.";
    }
    if (new Date(validTo) <= new Date(validFrom)) {
        return "End date must be after start date.";
    }

    // ✅ All good
    return null;
}
module.exports = validateCouponData;
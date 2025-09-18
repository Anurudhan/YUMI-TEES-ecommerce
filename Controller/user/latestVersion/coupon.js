const Coupon = require('../../../model/latestCouponModel');
const MESSAGES = require('../../../util/messages');


module.exports = {
    couponApply: async (req, res) => {
        try {
            const { couponCode, totalPrice } = req.body;
            const userId = req.session._id; // from auth middleware

            const coupon = await Coupon.findOne({ couponCode });
            if (!coupon) return res.status(400).json({ error: "Invalid coupon." });

            const today = new Date();

            // Validate status and date
            if (coupon.status !== "Active" || today < coupon.validFrom || today > coupon.validTo) {
            return res.status(400).json({ error: "Coupon not valid right now." });
            }

            // Minimum purchase
            if (totalPrice < coupon.minimumPurchaseAmount) {
            return res.status(400).json({ error: `Min purchase ₹${coupon.minimumPurchaseAmount}` });
            }

            // Usage limits
            if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ error: "Coupon usage limit reached." });
            }

            const userUsage = coupon.usedBy.find(u => u.userId.toString() === userId.toString());
            if (userUsage && userUsage.count >= coupon.perUserLimit) {
            return res.status(400).json({ error: "You already used this coupon." });
            }

            // Calculate discount
            let discount = coupon.discountType === "Flat"
            ? coupon.discountValue
            : Math.floor((totalPrice * coupon.discountValue) / 100);

            if (discount > totalPrice) discount = totalPrice;

            // Send preview
            res.json({
            success: true,
            discount,
            coupon: {
                id: coupon._id,
                code: coupon.couponCode,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },
};
const Coupon = require("../../../model/latestCouponModel");
const MESSAGES = require("../../../util/messages");
const validateCouponData=require("../../../util/validateCouponData")

module.exports = {
   getcoupon: async (req, res) => {
  try {
    const today = new Date();

    // Update expired coupons
    await Coupon.updateMany(
      { validTo: { $lt: today }, status: { $nin: ["Expired", "Delete"] } },
      { $set: { status: "Expired" } }
    );
    await Coupon.updateMany(
      { validFrom: { $lte: today }, status: "Upcoming" },
      { $set: { status: "Active" } }
    );
    // Pagination setup
    const page = parseInt(req.query.page) || 1; // default 1
    const limit = 8; // how many coupons per page
    const skip = (page - 1) * limit;

    // Count total coupons
    const totalCoupons = await Coupon.countDocuments({
      status: { $in: ["Active", "Expired","Upcoming"] },
    });

    const totalPages = Math.ceil(totalCoupons / limit);

    // Fetch paginated coupons (latest added first)
    const coupon = await Coupon.find({
      status: { $in: ["Active", "Expired","Upcoming"] },
    })
      .sort({ _id: -1 }) // ✅ latest added first (use createdAt if timestamps are enabled)
      .skip(skip)
      .limit(limit);

    // Calculate range for display (optional, if you want "showing X to Y of Z")
    const start = skip + 1;
    const end = Math.min(skip + limit, totalCoupons);

    if (req.xhr) {
      return res.render("admin/LatestPartial/couponTable", {
        coupon,
        currentPage: page,
        totalPages,
        totalCoupons,
        start,
        end,
      });
    }

    res.render("admin/latestCoupon", {
      coupon,
      currentPage: page,
      totalPages,
      totalCoupons,
      start,
      end,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
}
,
    addcoupon : async (req,res)=>{
    try{
        const { couponCode, description, minimumPurchaseAmount, discountType, discountValue, validFrom, validTo } = req.body;

        // Backend validation
        const error= validateCouponData({ couponCode, description, minimumPurchaseAmount, discountType, discountValue, validFrom, validTo });
        if (error) {
            return res.status(400).json({ errorMessage: error});
        }

        // Check for existing coupon
        const coupon = await Coupon.findOne({couponCode:couponCode});
        if(coupon){
            return res.json({errorMessage: MESSAGES.COUPON.ERROR.EXISTS});
        }
        const today = new Date();
        let status = "Active";  // default
        if (new Date(validFrom) > today) {
            status = "Upcoming"; // not active yet
        }
        // Save new coupon
        const newCoupon = new Coupon({
            couponCode,
            description,
            minimumPurchaseAmount,
            discountType,
            discountValue,
            validFrom,
            validTo,
            status
        });

        await newCoupon.save();
        res.status(201).json({successMessage: MESSAGES.COUPON.SUCCESS.ADDED});
        
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: MESSAGES.COUPON.ERROR.SERVER });
    }
},

    coupon : async (req,res)=>{
        try{
            console.log(req.params);
            const id = req.params.id
            const coupon = await Coupon.findOne({_id:id})
            res.json({coupon})
        }
        catch(err){
            console.log(err);
        }
    },
    editcoupon : async (req,res) => {
    try{
        const id = req.params.id;
        const { couponCode, description, minimumPurchaseAmount, discountType, discountValue, validFrom, validTo } = req.body;

        // Backend validation
        const error = validateCouponData({ couponCode, description, minimumPurchaseAmount, discountType, discountValue, validFrom, validTo });
        if (error) {
            return res.status(400).json({ errorMessage: error });
        }

        // Check duplicate coupon code
        const coupon = await Coupon.findOne({ couponCode, _id: { $ne: id } });
        if(coupon){
            return res.json({ errorMessage: MESSAGES.COUPON.ERROR.EXISTS });
        }
        const today = new Date();
        let status = "Active";  // default
        if (new Date(validFrom) > today) {
            status = "Upcoming"; // not active yet
        }

        await Coupon.updateOne(
            { _id: id },
            { couponCode, description, minimumPurchaseAmount, discountType, discountValue, validFrom, validTo, status}
        );

        res.json({ successMessage: MESSAGES.COUPON.SUCCESS.UPDATED });

    } catch(err){
        console.error(err);
        res.status(500).json({ error: MESSAGES.COUPON.ERROR.SERVER });
    }
},
    deleteCoupon : async (req,res)=>{
        try{
            const coupon = await Coupon.findById(req.params.id);
            if (!coupon) {
                return res.status(404).json({ success: false, message: MESSAGES.COUPON.ERROR.NOT_FOUND});
            }
            if (coupon.usedCount > 0) {
                return res.status(400).json({ success: false, message: MESSAGES.COUPON.ERROR.CAN_NOT_DELETE });
            }
            await Coupon.updateOne({_id:coupon._id},{$set:{status:"Delete"}})
            res.json({success:true})
        }
        catch(err){
            console.log(err);
        }
    }
}
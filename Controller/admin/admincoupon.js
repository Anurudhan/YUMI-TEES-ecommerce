const Coupon = require("../../model/coupon");
const MESSAGES = require("../../util/messages");

module.exports = {
    getcoupon : async (req,res)=>{
        try{
            const coupon = await Coupon.find({status:{$in:["Active","Expired"]}})
            res.render("admin/coupon",{coupon})
        }
        catch(err){
            console.log(err);
        }
    },
    addcoupon : async (req,res)=>{
        try{
            const { couponCode, description, minimumPurchaseAmount, discountAmount, validFrom, validTo } = req.body;
            console.log(couponCode);
            const coupon = await Coupon.findOne({couponCode:couponCode})
            if(coupon){
                res.json({errorMessage:MESSAGES.COUPON.ERROR.EXISTS})
            }
            else{
                const newCoupon = new Coupon({
                    couponCode,
                    description,
                    minimumPurchaseAmount,
                    discountAmount,
                    validFrom,
                    validTo
                });

                newCoupon.save()
                    .then(savedCoupon => {
                        res.status(201).json({successMessage:MESSAGES.COUPON.SUCCESS.ADDED});
                    })
                    .catch(error => {
                        console.error('Error saving coupon:', error);
                        res.status(500).json({ error: MESSAGES.COUPON.ERROR.SERVER });
                    });
            }     
        }
        catch(err){
            console.log(err);
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
            const id = req.params.id
            console.log(id);
            const { couponCode, description, minimumPurchaseAmount, discountAmount, validFrom, validTo } = req.body;
            const coupon=await Coupon.find({couponCode:couponCode})
            if(coupon.length>1){
                res.json({errorMessage:MESSAGES.COUPON.ERROR.EXISTS})
            }
            else{
                await Coupon.updateOne({_id:id},{couponCode, description, minimumPurchaseAmount, discountAmount, validFrom, validTo})
                res.json({successMessage:MESSAGES.COUPON.SUCCESS.UPDATED})
            }
            
        }
        catch(err){
            console.log(err);
        }
    },
    deleteCoupon : async (req,res)=>{
        try{
            const id = req.params.id;
            await Coupon.updateOne({_id:id},{$set:{status:"Delete"}})
            res.json({success:true})
        }
        catch(err){
            console.log(err);
        }
    }
}
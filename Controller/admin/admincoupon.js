const Coupon = require("../../model/coupon")

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
                res.json({errorMessage:"This coupon code already exist"})
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
                        res.status(201).json({successMessage:"Coupon added successfully"});
                    })
                    .catch(error => {
                        console.error('Error saving coupon:', error);
                        res.status(500).json({ error: 'Internal server error' });
                    });
            }     
        }
        catch(err){
            console.log(err);
        }
    },
    coupon : async (req,res)=>{
        try{
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
            const coupon=await Coupon.findOne({couponCode:couponCode})
            if(coupon){
                res.json({errorMessage:"This coupon code already exist"})
            }
            else{
                await Coupon.updateOne({_id:id},{couponCode, description, minimumPurchaseAmount, discountAmount, validFrom, validTo})
                res.json({successMessage:"Coupon updated succesfully"})
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
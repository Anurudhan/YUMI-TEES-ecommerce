const User = require("../model/usermodel");
const Wishlist = require("../model/wishlist");
const Whishlist = require("../model/wishlist");

module.exports = {
    wishCount : async (req , res, next)=>{
        try{
            let wish = 0;
            if(req.session.logged){
                const userEmail=req.session.email;
                const user = await User.findOne({ email: userEmail });
                const userId = user._id;
                const userWhish = await Wishlist.findOne({userid:userId});
                if(userWhish!=null && userWhish!=undefined){
                    console.log("hi----->");
                    wish=userWhish.products.length
                    req.session.wish=wish
                    next()
                }
                else {
                    req.session.wish=wish;
                    next();
                }
            }  
            else{
                req.session.wish=wish;
                next();
            }       
        }
        catch(err){
            console.log(err);
        }
    }
}
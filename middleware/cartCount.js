const User = require("../model/usermodel")
const Cart = require("../model/cartmodel")
module.exports={
 CountOfCart: async (req, res, next) => {
    try {
        let cartCount = 0;
            let cart=0;
        if(req.session.logged){
            const userEmail=req.session.email;
            const user = await User.findOne({ email: userEmail });
            const userId = user._id;
            const userCart = await Cart.findOne({userid:userId});
            console.log(userCart);
        if(userCart!=null && userCart!=undefined){
            console.log("hi----->");
            cart=userCart.products.length
            if(cart!=0){
                for (const product of userCart.products) {
                    cartCount += product.quantity;
                }
            }
            req.session.cart=cart
            req.session.cartCount = cartCount;
            next()
            }
            else {
                req.session.cart=cart
                req.session.cartCount = cartCount;
                next();
            }
        }
        else {
            req.session.cart=cart
            req.session.cartCount = cartCount;
            next();
            }  
    }catch (error) {
        console.error(error);
        res.locals.cartCount = 0; 
        next();
    }
}
}

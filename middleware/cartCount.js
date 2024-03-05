const User = require("../model/usermodel")
const Cart = require("../model/cartmodel")
module.exports={
 CountOfCart: async (req, res, next) => {
    try {
        if(req.session.logged){
            const userEmail=req.session.email;
            const user = await User.findOne({ email: userEmail });
            const userId = user._id;
            const userCart = await Cart.findOne({userid:userId});
            let cartCount = 0;
            let cart=0;
            if (userCart) {
                cart=userCart.products.length
                for (const product of userCart.products) {
                    cartCount += product.quantity;
                }
            }
            else next();
            req.session.cart=cart
            req.session.cartCount = cartCount;
        }
        else next();  
    }catch (error) {
        console.error(error);
        res.locals.cartCount = 0; 
        next();
    }
}
}

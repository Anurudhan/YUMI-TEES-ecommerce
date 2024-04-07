module.exports = {
    getwishlist : async (req,res)=>{
        try{
            const username = req.session.username;
            const cart = req.session.cart
            res.render("user/wishlist",{username,cart})
        }
        catch(err){
            console.log(err);
        }
    }
}
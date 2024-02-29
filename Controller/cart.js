const User = require("../model/usermodel")
const Cart = require("../model/cartmodel")
const Product =require("../model/productSchema")

module.exports={
    cartpage:async (req,res)=>{
        try{
            const useremail=req.session.email;
            const username = req.session.username;
            console.log(useremail);
            const user = await User.findOne({email:useremail})
            const kart = await Cart.findOne({ userid: user._id }).populate(
                { path: "products.productid", populate: { path: 'Category', model: 'category' } });
            const carts = kart.products;
            let grandtotal = 0
            let disctotal = 0
            carts.forEach((cur)=>{
                grandtotal += cur.productid.price*cur.quantity;
                disctotal += cur.productid.discountAmount*cur.quantity;
            }) 
            req.session.grandtotal = grandtotal
            req.session.disctotal = disctotal
            totalprice = grandtotal-disctotal;  
            console.log(totalprice);         
            res.render("user/cart",{username,cart:req.session.cart,carts,grandtotal,disctotal,totalprice})
        }
        catch(err){
            console.log(err);
        }
    },
    addcart: async (req,res)=>{
        try{
            const userEmail = req.session.email;
            const user = await User.findOne({ email: userEmail });  
            const userId = user._id;    
            const productId = req.params.id;    
            const change=req.params.change;
            
            const check = await Cart.findOne({ userid: userId });    
            const product= await Product.findOne({_id:productId})
            if(product.stockQuantity!=0){
                if (check == null) {
                    const cartData = {
                        userid: userId,
                        products: [{ productid: productId, quantity: 1 }]
                    }
                    await Cart.create(cartData)
                    res.json({ msg: "Product added to cart Successfully" })
                    
                } else {
                    const existPrdct = await Cart.findOne({ userid: userId, 'products.productid': productId })
                    if (existPrdct) {
                        await Cart.updateOne(
                            { userid: userId, 'products.productid': productId },
                            { $inc: { 'products.$.quantity': change } }
                        )
                        res.json({ msg: "Product quantity updated" })
                    } else {
                        await Cart.updateOne(
                            { userid: userId },
                            { $push: { products: { productid: productId, quantity: 1} } }
                        )
                        res.json({ msg: "New product added" })
                    }
            }
            }
            else {
                res.json({ msg: "out of stock  product" })
            }
            
    }
        catch(err){
            console.log(err);
        }
    },
    removeCart:async (req,res)=>{
        try{
            await Cart.updateOne({
                _id:req.params.id
            },
            {
                $pull:
                {
                    products:
                    {
                        productid: req.params.id.trim()
                    }
                }
            })
            res.json({msg:'Product removed from cart successfully'})
        }catch(err){
            console.log(err);
        }
        
    }
}
const Addres = require('../model/address');
const Cart = require("../model/cartmodel");
const Order = require('../model/order');
module.exports = {
    getplaceorder:async(req,res)=>{
        try{
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.errorMessage
            delete req.session.successMessage
            let username=req.session.username;
            let cart=req.session.cart;
            req.session.addadress=true;
            const grandtotal = req.session.grandtotal
            const disctotal = req.session.disctotal
            totalprice = grandtotal-disctotal
            const [address,carts,orders] = await Promise.all([
                Addres.find({userid:req.session._id}),
                Cart.findOne({userid:req.session._id}),
                Order.findOne({userid:req.session._id})
            ])
            console.log(address);
            if(carts){
                res.render("user/placeorder",{address,orders,successMessage,errorMessage,adrsSelect:req.session.address_id,username,cart,grandtotal,disctotal,totalprice})
            }
            else{
                res.redirect("/home")
            }
        }
        catch(err){
            console.log(err);
        }
    }
}
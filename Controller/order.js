const Addres = require('../model/address');
const Cart = require("../model/cartmodel");
const Order = require('../model/order');
const User = require("../model/usermodel");
const Product = require("../model/productSchema");
const session = require('express-session');
const { resetpassword } = require('./controller');
module.exports = {
    getorder:async(req,res)=>{
        try{
            const cart=req.session.cart
            const username = req.session.username
            const perPage = 6; // Set the number of orders per page
    
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * perPage;
            const [orders, orderCount] = await Promise.all([
                Order.find({ userid: req.session._id}).populate(
                    { path: "products.productid", model:'product', populate: 
                    { path: 'Category', model: 'category' } })
                    .sort({ orderdate: -1 }).skip(skip).limit(perPage),
                    
                Order.find({ userid: req.session._id }).count()
            ]);
            console.log(orders);
            console.log(orderCount,req.session._id)
            const totalPages = Math.ceil(orderCount / perPage);
            res.render("user/Orderlist",{username,cart,orders,orderCount})
        }
        catch(err){
            console.log(err);
        }
    },
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
            console.log(orders);
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
    },
    getaddress:async(req,res)=>{
        try{
            console.log(req.params.id);
            req.session.address_id = req.params.id
            const address = await Addres.findOne({_id:req.params.id})
            if(!address){
                return res.status(404).json({ error: 'Address not found' });
            }
            res.json("success");
        }
        catch(err){
            console.log(err);
        }
    },
    confirmorder:async(req,res)=>{
        try{
            const payment = req.params.type;
            console.log(payment+"------------------------->");
            const address_id = req.session.address_id
            const grandtotal = req.session.grandtotal
            const disctotal = req.session.disctotal
            const totalprice = grandtotal-disctotal
            const userEmail = req.session.email
            delete req.session.address_id
            if (address_id == null) {
                req.session.errorMessage="please select the address or add address"
                res.redirect("/placeorder")
            }
            else if(payment=="cashOnDelivery"){
                const user = User.findOne({email:userEmail})
                const [address, carts] = await Promise.all([
                    Addres.findOne({ _id: address_id }),
                    Cart.findOne({ userId: user._id })
                ])
                console.log(carts);
                // date setting------------------------------------------
                const currentDate = new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                });

                // delivery date ----------------------------------------  
                const deliveryDate = new Date(
                    Date.now() + 4 * 24 * 60 * 60 * 1000
                ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

                let myOrders = {
                    userid: req.session._id,
                    products: carts.products,
                    address: {
                        name: address.name,
                        address: address.address,
                        locality: address.locality,
                        city: address.city,
                        district: address.district,
                        state: address.state,
                        pincode: address.pincode,
                    },
                    orderdate: currentDate,
                    expectedDeliveryDate: deliveryDate,
                    paymentMethod: payment,
                    PaymentStatus: "Pending",
                    orderStatus: "Order Processed",
                    totalAmount: totalprice,
                    discountAmount: disctotal,
                }
                await Order.create(myOrders)

                const prodcts = carts.products
                console.log(prodcts);
                for (const data of prodcts) {
                    const prodctId = data.productid
                    const orderQty = data.quantity
                    
                    const prdt = await Product.findOne({ _id: prodctId })
                    
                    const stock = prdt.stockQuantity
                    const newStock = stock - orderQty
                    
                    await Product.updateOne({ _id: prodctId }, { $set: { stockQuantity: newStock } })
                    
                }
                await Cart.findByIdAndDelete(carts._id)
                console.log("sucess------------------------------------> ");
                res.render("user/paymentsuccess")
            }
        }
        catch(err){
            console.log(err);
        }
    },
    getorderdetails:async (req,res)=>{
        try{
            const cart=req.session.cart
            const username = req.session.username
            res.render("user/Orderdetails",{cart,username})
        }
        catch(err){
            console.log(err);
        }
    }
}
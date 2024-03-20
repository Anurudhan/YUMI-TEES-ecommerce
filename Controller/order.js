const Addres = require('../model/address');
const Cart = require("../model/cartmodel");
const Order = require('../model/order');
const User = require("../model/usermodel");
const returns = require('../model/return');
const Product = require("../model/productSchema");
const session = require('express-session');
const { resetpassword } = require('./controller');
module.exports = {
    getorder:async(req,res)=>{
        const cart = req.session.cart;
        const username = req.session.username;
        const perPage = 6; // Set the number of orders per page
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * perPage;

        try {
            const [orders, orderCount] = await Promise.all([
            Order.find({ userid: req.session._id })
                .populate({
                    path: "products.productid",
                    model: 'product',
                    populate: {
                        path: 'Category',
                        model: 'category'
                    }
                })
                .sort({ orderdate: -1 })
                .skip(skip)
                .limit(perPage),
            Order.countDocuments({ userid: req.session._id })
        ]);

        const totalPages = Math.ceil(orderCount / perPage);

        res.render("user/Orderlist", { username, cart, orders, orderCount, totalPages, page });
    } catch (error) {
        // Handle error
        console.error("Error fetching orders:", error);
        res.status(500).send("Error fetching orders. Please try again later.");
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
                        mobile:address.mobile
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
            const id = req.params.id
            const order = await Order.findOne({ _id: id}).populate(
                { path: "products.productid", model:'product', populate: 
                { path: 'Category', model: 'category' } })
            const cart=req.session.cart
            const username = req.session.username
            console.log(order);
            res.render("user/Orderdetails",{cart,username,order})
        }
        catch(err){
            console.log(err);
        }
    },
    cancelallorder:async (req,res)=>{
        try{
            const id = req.params.id
            const ordr = await Order.findOne({ _id: id })
            ordr.orderStatus = "Cancelled"
            await ordr.save();
            await Order.updateOne(
                { _id: id },
                { $set: { 'products.$[].status': 'Cancelled' } })
            ordr.products.forEach(async data => {
                const prdkt = await Product.findOne({ _id: data.productid })
                    if (prdkt) {
                        prdkt.stockQuantity = prdkt.stockQuantity + data.quantity
                        await prdkt.save()
                    }
            });
            res.status(200).json({ message: 'All orders canceled successfully' });
        }
        catch(err){
            console.log(err);
        }
    },
    cancelsingleorder: async (req,res)=>{
        try{
            const id = req.params.id
            let index = req.params.index
            const ordr = await Order.findOne({ _id: id })
            if(ordr.products.length==1){
                ordr.orderStatus = "Cancelled"
                await ordr.save();
            }
            await Order.updateOne({ _id: id }, { $set: { [`products.${index}.status`]: "Cancelled" } })
            const prdkt = await Product.findOne({ _id: ordr.products[index].productid })
                if (prdkt) {
                    prdkt.stockQuantity = prdkt.stockQuantity + data.quantity
                    await prdkt.save()
                }
            res.status(200).json({ message: 'All orders canceled successfully' });
        }
        catch(err){
            console.log(err);
        }
    },
    returnorder : async(req,res)=>{
        try{
            console.log(req.body);
            const { reason, orderId, index, description } = req.body
            const ordr = await Order.findOne({_id:orderId})
            console.log(ordr)
            const returnData = {
                userid: ordr.userid,
                orderid: orderId,
                productid: ordr.products[index].productid,
                returnReason: reason,
                description: description,
            }
            console.log("return---------------------------------------------------->")
            await returns.create(returnData)
            await Order.updateOne(
                { _id: orderId },
                { $set: { [`products.${index}.status`]: 'Return Requested' } }
                );
                console.log("finished----------------------------------------------->")
                res.status(200).json({ message: 'Order returned successfully' });
            }
        catch(err){
            console.log(err);
        }
    }
}
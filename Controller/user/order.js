const Addres = require('../../model/address');
const Cart = require("../../model/cartmodel");
const Order = require('../../model/order');
const User = require("../../model/usermodel");
const returns = require('../../model/return');
const Product = require("../../model/productSchema");
const Coupon = require("../../model/coupon")
const Wallet = require("../../model/wallet")
const WalletHistory = require("../../model/walletHistory")
const mongoose = require('mongoose');
const crypto = require('crypto');
const {createOrder} = require("../../Controller/user/razorpay")
const { generateInvoice } = require("../../util/invoiceCreator")
const session = require('express-session');
const { resetpassword } = require('./controller');
const {generateOrderId} = require('../../util/generateorderId');
module.exports = {
    getorder:async(req,res)=>{
        const cart = req.session.cart;
        const username = req.session.username;
        const wish =  req.session.wish;
        const perPage = 6; // Set the number of orders per page
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * perPage;

        try {
            const [orders, orderCount,pendingOrder] = await Promise.all([
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
            Order.countDocuments({ userid: req.session._id }),
            Order.find({userid: req.session._id,paymentMethod:"OnlinePayment",PaymentStatus:"Pending"})
        ]);
        console.log(orders);
        const totalPages = Math.ceil(orderCount / perPage);

        res.render("user/Orderlist", { username, cart, wish,orders, orderCount, totalPages, page , pendingOrder});
    } catch (error) {
        // Handle error
        console.error("Error fetching orders:", error);
        res.status(500).send("Error fetching orders. Please try again later.");
    }

    },
    getplaceorder:async(req,res)=>{
        try{
            const cpn = req.session.couponCode
            const cpndiscnt = req.session.cpnDiscount?req.session.cpnDiscount:0;
            const successMessage = req.session.successMessage;
            const errorMessage = req.session.errorMessage;
            delete req.session.errorMessage;
            delete req.session.successMessage;
            let username=req.session.username;
            let cart=req.session.cart;
            const wish = req.session.wish;
            req.session.addadress=true;
            const grandtotal = req.session.grandtotal
            const disctotal = req.session.disctotal
            totalprice = grandtotal-disctotal
            const [address,carts,orders] = await Promise.all([
                Addres.find({userid:req.session._id}),
                Cart.findOne({userid:req.session._id}),
                Order.findOne({userid:req.session._id}),
            ])
            const currenetdate = new Date();
            const coupon = await Coupon.find({$and:[{minimumPurchaseAmount:{$lte:req.session.totalprice}},{validTo:{$gte:currenetdate}},{validFrom:{$lte:currenetdate}},{status:"Active"}]})
            console.log(coupon,"hjfhggfdhfhg---------------------->");
            const couponCount = coupon.length;
            console.log(couponCount,"ghjgdshjfghjgdsh dfsghj-------------------->");
            console.log(orders);
            if(carts){
                res.render("user/placeorder",{address,orders,successMessage,errorMessage,adrsSelect:req.session.address_id,wish,username,cart,grandtotal,disctotal,totalprice,couponCount,coupon,cpn,cpndiscnt})
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
            const orderid = generateOrderId();
            const address_id = req.session.address_id
            const grandtotal = req.session.grandtotal
            const disctotal = req.session.disctotal
            const totalprice = req.session.totalprice
            req.session.deliverycharge = totalprice<1000?40:0;
            let  deliverycharge = req.session.deliverycharge;
            const userEmail = req.session.email
            delete req.session.address_id
            console.log(orderid);
            if (address_id == null) {
                console.log("no address----------------------->");
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

                //   if not coupen code ---------------------------------
                let couponCode = "";
                let couponDiscount = 0;

                //   if coupen code--------------------------------------
                if (req.session.cpnDiscount && req.session.couponCode) {
                    couponDiscount = req.session.cpnDiscount;
                    couponCode = req.session.couponCode;
                    delete req.session.cpnDiscount;
                    delete req.session.couponCode;
                }

                let myOrders = {
                    orderid : orderid,
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
                    couponCode: couponCode,
                    couponDiscount: couponDiscount,
                    totalAmount: totalprice,
                    discountAmount: disctotal,
                    deliverycharge:deliverycharge
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
                res.json({paymentMethod:"COD"})
            }
            else if(payment=="OnlinePayment"){
                console.log("I am here-------------------------->");
                const usr = await User.findOne({ email : userEmail})

                const [address, carts] = await Promise.all([
                    await Addres.findOne({ _id: address_id }),
                    await Cart.findOne({ userid: usr._id })
                ])
                // date setting------------------------------------------
                const currentDate = new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                });

                // delivery date ----------------------------------------  
                const deliveryDate = new Date(
                    Date.now() + 4 * 24 * 60 * 60 * 1000
                ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });


                //   if not coupen code ---------------------------------
                let couponCode = "";
                let couponDiscount = 0;

                //   if coupen code--------------------------------------
                if (req.session.cpnDiscount && req.session.couponCode) {
                    couponDiscount = req.session.cpnDiscount;
                    couponCode = req.session.couponCode;
                    delete req.session.cpnDiscount;
                    delete req.session.couponCode;
                }


                let myOrders = {
                    orderid: orderid,
                    userid: usr._id,
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
                    couponCode: couponCode,
                    couponDiscount: couponDiscount,
                    totalAmount: totalprice,
                    discountAmount: disctotal,
                    deliverycharge: deliverycharge
                }

                const odrr = await Order.create(myOrders)
                console.log(odrr._id,"--------------------------------------->hlo");
                const prdts = carts.products

                //to update the quantity in inventory
                for (const data of prdts) {

                    try {
                        prdId = data.productid
                        ordrQty = data.quantity

                        const prdt = await Product.findOne({ _id: prdId })

                        const stock = prdt.stockQuantity
                        const newStock = stock - ordrQty

                        await Product.updateOne({ _id: prdId }, { $set: { stockQuantity : newStock } })

                    } catch (error) {
                        console.log(error);
                    }
                }


                createOrder(req, res, odrr._id + "")

                await Cart.findByIdAndDelete(carts._id)

            }
            else if (payment == "walletPayment") {

            
                const usr = await User.findOne({ email: userEmail })
                const walet = await Wallet.findOne({ userid: usr._id })
       

                if (walet) {
                    
                    if (walet.wallet >= totalprice) {
                        await Wallet.updateOne({ userid: usr._id }, { $inc: { wallet: -totalprice } })

                        const [addrs, carts] = await Promise.all([
                            await Addres.findOne({ _id: address_id }),
                            await Cart.findOne({ userid: usr._id })
                        ])


                        // date setting------------------------------------------
                        const currentDate = new Date().toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                        });

                        // delivery date ----------------------------------------  
                        const deliveryDate = new Date(
                            Date.now() + 4 * 24 * 60 * 60 * 1000
                        ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });


                        //   if not coupen code ---------------------------------
                        let couponCode = "";
                        let couponDiscount = 0;

                        //   if coupen code--------------------------------------

                        if (req.session.cpnDiscount && req.session.couponCode) {
                            couponDiscount = req.session.cpnDiscount;
                            couponCode = req.session.couponCode;
                            delete req.session.cpnDiscount;
                            delete req.session.couponCode;
                        }

                        let myOrders = {
                            orderid:orderid,
                            userid: usr._id,
                            products: carts.products,
                            address: {
                                name: addrs.name,
                                address: addrs.address,
                                locality: addrs.locality,
                                city: addrs.city,
                                district: addrs.district,
                                state: addrs.state,
                                pincode: addrs.pincode,
                            },
                            orderdate: currentDate,
                            expectedDeliveryDate: deliveryDate,
                            paymentMethod: payment,
                            PaymentStatus: "Paid",
                            orderStatus: "Order Processed",
                            couponCode: couponCode,
                            couponDiscount: couponDiscount,
                            totalAmount: totalprice,
                            discountAmount: disctotal,
                            deliverycharge: deliverycharge
                        }

                        await Order.create(myOrders)

                        const prdts = carts.products

                        //to update the quantity in inventory
                        for (const data of prdts) {

                            try {
                                prdId = data.productid
                                ordrQty = data.quantity

                                const prdt = await Product.findOne({ _id: prdId })
                                const stock = prdt.stockQuantity
                                const newStock = stock - ordrQty

                                await Product.updateOne({ _id: prdId }, { $set: { stockQuantity: newStock } })

                            } catch (error) {
                                console.log(error);
                            }

                        }

                        const WalHist = await WalletHistory.findOne({ userid: usr._id })

                        if (WalHist) {
                            const reason = "Product Purchase With Wallet Amount";
                            const type = "debit";
                            const date = new Date();

                            await WalletHistory.updateOne(
                                { userid: usr._id },
                                { $push: {
                                        refund: {
                                            amount: totalprice,
                                            reason: reason,
                                            type: type,
                                            date: date,
                                        },
                                    },
                                },
                                { new: true }
                            );
                        } else {

                            const reason = "Product Purchase With Wallet Amount";
                            const type = "debit";
                            const date = new Date();
                            await WalletHistory.create({
                                userid: usr._id,
                                refund: [
                                    {
                                        amount: totalprice,
                                        reason: reason,
                                        type: type,
                                        date: date,
                                    },
                                ],
                            });
                        }
                        await Cart.findByIdAndDelete(carts._id)
                        res.json({paymentMethod : 'wallet'})
                    } else {
                        res.json({ msg: "Insufficient Balance in Wallet" })
                    }
                } else {

                    res.json({ msg: "Wallet doesn't exist" })
                }
            }
        }
        catch(err){
            console.log(err);
        }
    },
    repayment : async (req,res) => {
        try{
            console.log('reached to payfrom my order',req.params.id);
            const oder = await Order.findOne({userid : req.session._id,_id : req.params.id});

            req.session.rePaytotal = oder.totalAmount-oder.couponDiscount;
            req.session.deliverycharge = oder.totalAmount<1000?40:0;
            createOrder(req, res, oder._id + "")
        }
        catch(err){
            console.log(err);
        }
    },
    generateinvoice:async(req,res)=>{
        try{
            const { orderId,index } = req.params

            const orderDetails = await Order.findOne({ _id: orderId }).populate('products.productid')
            const deliveredProducts = orderDetails.products.filter(product => product.status === "Delivered");
            console.log(deliveredProducts);
            if (orderDetails) {
                console.log("vgfycytg---------------------------------");
                const invoicePath = await generateInvoice(orderDetails,index,deliveredProducts)
                res.json({ success: true, message: "Invoice generated successfully", invoicePath });

            } else {

                res.status(500).json({ success: false, message: "Invoice generation failed" });
            }

            console.log("generate invoice fuction is working ");
        }
        catch(err){
            console.log(err);
            res.status(500).json({ success: false, message: "Error in generating Invoice" });
        }
    },
    downloadinvoice : async (req,res)=>{
        try{

            const id = req.params.orderId;
            console.log(id);
            const filePath = `public/Invoice/${id}.pdf`;
            res.download(filePath,`invoice_${id}.pdf`);

        }
        catch(err){
            console.log(err);
        }
    },
    ordersucess : (req,res)=>{
        try{
            
            res.render("user/paymentsuccess")
        }
        catch(err){
            console.log(err);
        }
    },
    paymentFailed: (req,res)=>{
        try{
            const error = req.query.error;
            let id =  req.query.id;
            const objectId = new mongoose.Types.ObjectId(id);

            res.render('user/paymentfailed', { id: objectId });
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
            const username = req.session.username;
            const wish = req.session.wish;
            console.log(wish);
            console.log(order);
            res.render("user/Orderdetails",{cart,username,order,wish})
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
            if (ordr.paymentMethod == "OnlinePayment" && ordr.PaymentStatus == "Paid" || ordr.paymentMethod == "walletPayment") {
                const walletFind = await Wallet.findOne({ userid: ordr.userid })

                if (walletFind) {
                    await Wallet.updateOne({ userid: ordr.userid }, { $inc: { wallet: ordr.totalAmount } })
                } else {
                    await Wallet.create({
                        userid: ordr.userid,
                        wallet: ordr.totalAmount
                    })
                }
                //wallet history update
                const wallHstry = await WalletHistory.findOne({ userid: ordr.userid })
                if (wallHstry) {
                    const amount = ordr.totalAmount;
                    const reason = "Refund of cancelling order";
                    const type = "credit";
                    const date = new Date();
                    await WalletHistory.updateOne(
                        { userid: ordr.userid },
                        { $push: { refund: { amount: amount, reason: reason, type: type, date: date } } },
                        { new: true }
                    );
                } else {
                    const amount = ordr.totalAmount;
                    const reason = "Refund of cancelling order";
                    const type = "credit";
                    const date = new Date();
                    await WalletHistory.create({
                        userid: ordr.userid,
                        refund: [{ amount: amount, reason: reason, type: type, date: date }],
                    });
                }

                await Order.updateOne({_id: ordr._id},{$set: { PaymentStatus: "Refunded" } })
            }
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
            const ordr = await Order.findOne({ _id: id }).populate('products.productid');
            let totalAmount;
            console.log(totalAmount);
            if(ordr.products.length==1){
                ordr.orderStatus = "Cancelled";
                ordr.products[0].status = "Cancelled";
                await ordr.save();
                totalAmount = ordr.totalAmount
            }
            else{
                totalAmount = ordr.products[index].quantity*ordr.products[index].productid.grandprice;
                await Order.updateOne({ _id: id }, { $set: { [`products.${index}.status`]: "Cancelled" } })
            }
            if (ordr.paymentMethod == "OnlinePayment" && ordr.PaymentStatus == "Paid" || ordr.paymentMethod == "walletPayment") {
                const walletFind = await Wallet.findOne({ userid: ordr.userid })

                if (walletFind) {
                    await Wallet.updateOne({ userid: ordr.userid }, { $inc: { wallet: totalAmount } })
                } else {
                    await Wallet.create({
                        userid: ordr.userid,
                        wallet: totalAmount
                    })
                }
                //wallet history update
                const wallHstry = await WalletHistory.findOne({ userid: ordr.userid })
                if (wallHstry) {
                    const amount = totalAmount;
                    const reason = "Refund of cancelling a product";
                    const type = "credit";
                    const date = new Date();
                    await WalletHistory.updateOne(
                        { userid: ordr.userid },
                        { $push: { refund: { amount: amount, reason: reason, type: type, date: date } } },
                        { new: true }
                    );
                } else {
                    const amount = totalAmount;
                    const reason = "Refund of cancelling a product";
                    const type = "credit";
                    const date = new Date();
                    await WalletHistory.create({
                        userid: ordr.userid,
                        refund: [{ amount: amount, reason: reason, type: type, date: date }],
                    });
                }

                await Order.updateOne({_id: ordr._id},{$set: { PaymentStatus: "Refunded" } })
            }
            
            const prdkt = await Product.findOne({ _id: ordr.products[index].productid })
                if (prdkt) {
                    prdkt.stockQuantity = prdkt.stockQuantity +  ordr.products[index].quantity
                    await prdkt.save()
                }
            res.json({ success : true });
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
                quantity:ordr.products[index].quantity,
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
    },
    verifypayment : async(req,res)=>{
        try{
             //HMAC (Hash-based Message Authentication Code) using the SHA-256 algorithm

             let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
                console.log('Request Body:', req.body);
            hmac.update(
                req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id
            );

            const calculatedHmac = hmac.digest("hex"); // Log the calculated HMAC
            console.log("Calculated HMAC:", calculatedHmac);

            console.log("Signature from Request Body:", req.body.payment.razorpay_signature);

            if (calculatedHmac === req.body.payment.razorpay_signature) {
                        console.log("Entering if condition");
                        const orderId = req.body.order.receipt;
                        console.log(orderId);
                        const O = await Order.updateOne({ _id: orderId }, { $set: { PaymentStatus: "Paid" } });
                        console.log(O);

                        res.json({ success: true });

            } else {
                console.log("HMAC verification failed");
                res.json({ success: false, error: "Payment verification failed" });
            }
        }
        catch(err){
            console.log(err);
        }
    },
    couponapply:async (req,res)=>{
        try{
            if(req.session.couponCode){
                res.json({errorMsg:"This order already get coupon"})
            }
            else{
                const {couponcode} = req.body;
                console.log(couponcode);
                const coupon = await Coupon.findOne({couponCode:couponcode});
                req.session.totalprice -= coupon.discountAmount;
                req.session.couponCode = couponcode;
                req.session.cpnDiscount = coupon.discountAmount;

                console.log(req.session.totalprice,req.session.couponCode,req.session.cpnDiscount);

                res.json({success:true,successMsg:"Coupon applied In your Order"})
            }
        }
        catch(err){
            console.log(err);
        }
    },
    removecouponaply:async(req,res)=>{
        try{
            if(req.session.couponCode == null || req.session.couponCode == undefined){
                res.json({errorMsg:"Ther is no coupon apply"})
            }
            else{
                delete req.session.couponCode
                req.session.totalprice += req.session.cpnDiscount
                delete req.session.cpnDiscount
                res.json({successMsg:"Remove applied coupon in your Order"})
            }
        }
        catch(err){
            console.log(err);
        }
    }
}
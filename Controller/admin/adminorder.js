const Order = require("../../model/order")
const User  = require('../../model/usermodel');
const returns =require("../../model/return");
const Wallet = require("../../model/wallet")
const WalletHistory = require("../../model/walletHistory")
const product = require('../../model/productSchema');
module.exports={
    getorder: async (req,res)=>{
        try{
            let perPage=1
            let skip = 0
            const orders = await Order.aggregate([
                { $lookup: { from: 'users', localField: 'userid', foreignField: '_id', as: 'userName' } },
                { $unwind: '$userName' },
                { $sort: { orderdate: -1 } },
                {
                    $project: {
                        username: "$userName.name",
                        'userid': 1,
                        'products': 1,
                        'address': 1,
                        'orderdate': 1,
                        'expectedDeliveryDate': 1,
                        'paymentMethod': 1,
                        'PaymentStatus': 1,
                        'totalAmount': 1,
                        'deliveryDate': 1,
                        'orderStatus': 1,
                        'couponDiscount': 1,
                        'couponCode': 1,
                        'discountAmount': 1
                    }
                }
            ]);
            const retns = await returns.find()
            res.render("admin/orders",{orders,retns})
        }
        catch(err){
            console.log(err);
        }
    },
    orderstatuschanging:async(req,res)=>{
        try{
            const id = req.params.id
            const status = req.params.status;
            let flag=0;
            console.log(id);

            const currentDate = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
            });
            const ordr = await Order.findOne({ _id: id })
            if (status == "Order Confirmed") {
                await Order.updateOne({ _id: id }, { $set: { orderStatus: status } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await Order.updateOne({ _id: id }, { $set: { [`products.${index}.status`]: "Confirmed" } })
                    }
                });
            } else if (status == "Order Shipped") {
                await Order.updateOne({ _id: id }, { $set: { orderStatus: status } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await Order.updateOne({ _id : id }, { $set: { [`products.${index}.status`]: "Shipped" } })
                    }
                });
            } else if (status == "Order Delivered") {
                if(ordr.paymentMethod == "OnlinePayment" && ordr.PaymentStatus == "Pending"){
                    flag=1;
                }
                else{
                await Order.updateOne({ _id: id }, { $set: { orderStatus: status, deliveryDate: currentDate, PaymentStatus: "Paid" } })
                ordr.products.forEach(async (data, index) => {
                    if (data.status != "Cancelled") {
                        await Order.updateOne({ _id: id }, { $set: { [`products.${index}.status`]: "Delivered" } })
                    }
                });
            }
            } else if (status == "Order Rejected") {
                const userid = ordr.userid
                const details = req.body.reason
                await User.updateOne({_id:userid},{$set:{orderreject:true}})
                ordr.products.forEach(async data => {
                    const prdkt = await product.findOne({ _id: data.productid })
                    if (prdkt) {
                        prdkt.stockQuantity = prdkt.stockQuantity + data.quantity
                        await prdkt.save()
                    }
                });
                await Order.updateOne({ _id: id }, { $set: { orderStatus: status, rejectedDate: currentDate,rejectdetails: details} })
            }
            if(flag==1){
                res.json({ errorMessage : true });
            }
            else{
                res.json({ success: true });
            }
        }
        catch(err){
            console.log(err);
        }
    },
    getorderdetails:async (req,res)=>{
        try{
            const orderId = req.params.id;
            console.log(orderId,"gjsagjgajsghdjags--------------->");
            const orders = await Order.findById({_id:orderId}).populate(
                { path: "products.productid", model:'product', populate: 
                { path: 'Category', model: 'category' } });
            if (!orders) {
              return res.render("error/admin404");
            }
        
            const user = await User.findById({_id:orders.userid});
            const orderedProducts = orders.products
            console.log(orderedProducts);
        
            let customerOrderTotal = 0;
            orderedProducts.forEach((product) => {
              customerOrderTotal +=
                product.productid.grandprice * product.quantity;
            });
            console.log(orders.address);
        
            res.render("admin/orderdetailing", {
              orderedProducts,
              customerName: orders.address.name,
              customerAddress: orders.address,
              customerOrderTotal
            });
        }
        catch(err){
            console.log(err);
        }
    },
    getreturnrequest:async(req,res)=>{
        try{
            const orderId = req.params.id;
            console.log(orderId);
            const orders = await Order.findById({_id:orderId}).populate(
                { path: "products.productid", model:'product', populate: 
                { path: 'Category', model: 'category' } });
            const retrn = await returns.find({orderid:orderId})
            console.log(retrn);
            res.render("admin/returnproducts",{orders,retrn})
        }
        catch(err){
            console.log(err);
        }
    },
    returnapproove:async (req,res)=>{
        try{
           
            const return_id = req.body.return_id
            const retn = await returns.findOne({_id:return_id})
            await returns.updateOne({_id:return_id},{$set:{status:"Return Approoved"}})
            const ordr = await Order.findOne({_id:retn.orderid})
            const Prdct = await product.findOne({_id:retn.productid})
            const totalAmount = Prdct.grandprice*retn.quantity
            if(ordr.products.length == 1){
                await Order.updateOne({_id:ordr.id},{$set:{orderStatus:"Order Returned"}})
            }
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
                    const reason = "Refund of return a product";
                    const type = "credit";
                    const date = new Date();
                    await WalletHistory.updateOne(
                        { userid: ordr.userid },
                        { $push: { refund: { amount: amount, reason: reason, type: type, date: date } } },
                        { new: true }
                    );
                } else {
                    const amount = totalAmount;
                    const reason = "Refund of return a product";
                    const type = "credit";
                    const date = new Date();
                    await WalletHistory.create({
                        userid: ordr.userid,
                        refund: [{ amount: amount, reason: reason, type: type, date: date }],
                    });
                }

                await Order.updateOne({_id: ordr._id},{$set: { PaymentStatus: "Refunded" } })
            res.json({success:true})
        }
        catch(err){
            console.log(err);
        }
    }

}
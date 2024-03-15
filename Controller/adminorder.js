const Order = require("../model/order")
const User  = require('../model/usermodel');
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
            res.render("admin/orders",{orders})
        }
        catch(err){
            console.log(err);
        }
    },
    getorderdetails:async (req,res)=>{
        try{
            const orderId = req.params.id;
            console.log(orderId);
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
    }

}
const Order = require("../model/order")
module.exports={
    getorder: async (req,res)=>{
        try{
            let perPage=1
            let skip = 0
            const orders = await Order.find().populate(
                                    { path: "products.productid", model:'product', populate: 
                                    { path: 'Category', model: 'category' } })
                                    .sort({ orderdate: -1 }).skip(skip).limit(perPage)
            res.render("admin/orders",{orders})
        }
        catch(err){
            console.log(err);
        }
    }

}
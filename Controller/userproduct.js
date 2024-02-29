const Product=require("../model/productSchema")
const Category=require("../model/category")
const Cart = require("../model/cartmodel")
module.exports={
    getallproduct: async (req,res)=>{
        try{
            const pageSize = 6; // Set your desired page size
            const currentPage = parseInt(req.query.page) || 1;
            const [product,count,categories] = await Promise.all([
                Product.find({displayStatus:"Show"}).skip((currentPage-1)*pageSize).limit(pageSize),
                Product.find({displayStatus:"Show"}).count(),
                Product.aggregate([{
                    $lookup:{
                        from:"categories",
                        localField:"Category",
                        foreignField:"_id",
                        as:"categoryInfo"
                    }
                },
                {
                    $unwind: '$categoryInfo'
                },
                {
                    $group: {
                        _id: {
                            categoryId: '$categoryInfo._id',
                            categoryName: '$categoryInfo.categoryname'
                        },
                        count: { $sum: 1 }
                    }
                }])
            ])
            console.log(categories);
            const totalpages = Math.ceil(count/pageSize);
            let username=req.session.username;
            let cart=req.session.cart
            res.render("user/allproduct",{product,categories,count,totalpages,currentPage,username,cart})
        }
        catch(err){
            console.log(err);
        }
    },
    uniqueproduct:async (req,res)=>{
        try{
            const id=req.params.id
            const product= await Product.findOne({_id:id})
            console.log(product);
            let username=req.session.username;
            let cart=req.session.cart
            let checkcart = await Cart.findOne({"products.productid":id})
            res.render("user/uniqueproduct",{product:product,username,cart,checkcart})
        }
        catch(err){
            console.log(err);
        }
    }
}
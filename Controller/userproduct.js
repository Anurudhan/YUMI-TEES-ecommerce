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
    searchproduct:async(req,res)=>{
        try{
            let username=req.session.username;
            let cart=req.session.cart
            searchTerm = req.query.search
            const category= await Category.findOne({ categoryname: { $regex: searchTerm, $options: "i" } })
            console.log(category);
            const searchOptions = {
                $or:[
                    {productName:{ $regex: searchTerm, $options: "i" }},
                    {Category:category}
                ],
                displayStatus : "Show"
            }
            const searchvalues = await Product.find(searchOptions).populate({path: 'Category', model: 'category'})
            console.log(searchvalues);
            res.render('user/searcgproducts', {username, searchvalues, searchTerm,cart });
            
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
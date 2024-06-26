const Product=require("../../model/productSchema")
const Category=require("../../model/category")
const Cart = require("../../model/cartmodel")
module.exports={
    getallproduct: async (req,res)=>{
        try{
            const existingQueryString = req.originalUrl.split('?')[1] ? `&${req.originalUrl.split('?')[1]}` : ''
            const { Category, min, max} = req.query
            console.log(Category);
            const pageSize = 6; 
            const currentPage = parseInt(req.query.page) || 1;
            let username=req.session.username;
            let cart=req.session.cart;
            const wish = req.session.wish;
            let product;
            let flag;
            if(Category == undefined && min == undefined && max==undefined){
                flag=0
                product = await Product.find({displayStatus:"Show"}).skip((currentPage-1)*pageSize).limit(pageSize)
                 
            }
            else if(Category == undefined ){
                flag=1
                product = await Product.find({grandprice: { $gte: min, $lte: max},displayStatus: "Show"}).skip((currentPage-1)*pageSize).limit(pageSize).populate({path: 'Category', model: 'category'});
            }
            else{
                flag=1;
                product = await Product.find({Category: { $in : Category},
                    grandprice: { $gte: min, $lte: max},
                    displayStatus: "Show"}).skip((currentPage-1)*pageSize).limit(pageSize).populate({path: 'Category', model: 'category'});
            } 
            const [count,categories] = await Promise.all([
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
                            categoryName: '$categoryInfo.categoryname',
                            Status:'$categoryInfo.Status'
                        },
                        count: { $sum: 1 }
                    }
                }])
            ])
            const totalpages = Math.ceil(count/pageSize);   
            res.render("user/allproduct",{product,categories,count,totalpages,currentPage,wish,username,cart,flag,existingQueryString})
            
        }
        catch(err){
            console.log(err);
        }
    },
    searchproduct:async(req,res)=>{
        try{
            let username=req.session.username;
            let cart=req.session.cart;
            const wish = req.session.wish;
            let searchTerm = req.query.search;
            const { Ctgory, min, max} = req.query;
            console.log("ashjgjhgashsh----------------->"+searchTerm);
            console.log("jgjgjgjs=---------------------->"+Ctgory);
            const pageSize = 4; 
            const currentPage = parseInt(req.query.page) || 1;
            const existingQueryString = req.originalUrl.split('?')[1] ? `&${req.originalUrl.split('?')[1]}` : '';
            console.log("ashjgjhgashsh----------------->"+searchTerm);
            let category;
            let searchOptions;
            let flag;
            if(Ctgory == undefined && min == undefined && max==undefined){
                flag=0
                category= await Category.findOne({ categoryname: { $regex: searchTerm, $options: "i" } });
                searchOptions = {
                    $or:[
                        {productName:{ $regex: searchTerm, $options: "i" }},
                        {Category:category}
                    ],
                    displayStatus : "Show"
                }
            }
            else if(Ctgory == undefined ){
                flag=1;
                category= await Category.findOne({ categoryname: { $regex: searchTerm, $options: "i" } });
                searchOptions = {
                    $or:[
                        {productName:{ $regex: searchTerm, $options: "i" }},
                        {Category:category}
                    ],
                    displayStatus : "Show",
                    grandprice: { $gte: min, $lte: max}
                }
            }
            else{
                flag=1;
                searchOptions = {
                    $and:[
                        {productName:{ $regex: searchTerm, $options: "i" }},
                        {Category:Ctgory}
                    ],
                    displayStatus : "Show",
                    grandprice: { $gte: min, $lte: max}
                }
            }
            const searchvalues = await Product.find(searchOptions).skip((currentPage-1)*pageSize).limit(pageSize).populate({path: 'Category', model: 'category'});
            const categories = await Category.find()
            const count = await Product.find({
                $or:[
                    {productName:{ $regex: searchTerm, $options: "i" }},
                    {Category:category}
                ],
                displayStatus : "Show",
            }).count()
            const totalpages = Math.ceil(count/pageSize);   
            console.log(searchvalues);
            res.render('user/searcgproducts', {username, searchvalues, searchTerm,cart,wish ,categories,flag,existingQueryString,count,totalpages,currentPage});
            
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
            let cart=req.session.cart;
            const wish = req.session.wish;
            let checkcart = await Cart.findOne({"products.productid":id})
            res.render("user/uniqueproduct",{product:product,username,cart,wish,checkcart})
        }
        catch(err){
            console.log(err);
        }
    }
}
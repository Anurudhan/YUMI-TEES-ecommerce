const Category=require("../model/category")

module.exports={
    categorypage:async(req,res)=>{
        try{
            const category=await Category.find()
            res.render("admin/category",{category:category})
        }
        catch(err){
            console.log(err);
        }
    },
    addcategory:async(req,res)=>{
        try{
            res.render("admin/addcategory",{err:null})
        }
        catch(err){
            console.log(err);
        }
    },
    postaddcategory:async(req,res)=>{
        try{
            let cat=req.body.catagoryname;
            cat = cat.toUpperCase()
            console.log(cat);
            const exist= await Category.findOne({categoryname:cat})
            if(exist){
                res.render("admin/addcategory",{err:"This category also exist"})
            }
            else{
                await Category.create({categoryname:cat})
                res.redirect("/admin/category")
            }
        }
        catch(err){
            console.log(err);
        }
    },
    deletecategory:async(req,res)=>{
        try{
            const id=req.params.id
            const name=req.params.name
            const result = await Category.findByIdAndDelete(id);
            if (!result) {
                return res.status(404).send('Category not found');
                }
            res.sendStatus(200);

        }
        catch(err){
            console.log(err);
        }
    }
}
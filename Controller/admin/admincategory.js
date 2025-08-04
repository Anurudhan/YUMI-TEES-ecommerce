const Category=require("../../model/category")
const MESSAGES = require("../../util/messages")

module.exports={
    categorypage:async(req,res)=>{
        try{
            const errorMessage=req.session.errorMessage
            const successMessage = req.session.successMessage
            delete req.session.errorMessage
            delete req.session.successMessage
            const category=await Category.find()
            res.render("admin/category",{category:category,successMessage,errorMessage})
        }
        catch(err){
            console.log(err);
        }
    },
    addcategory:async(req,res)=>{
        try{
            const errorMessage=req.session.errorMessage
            const successMessage = req.session.successMessage
            delete req.session.errorMessage
            delete req.session.successMessage
            res.render("admin/addcategory",{successMessage,errorMessage})
        }
        catch(err){
            console.log(err);
        }
    },
    postaddcategory:async(req,res)=>{
        try{
            let cat=req.body.catagoryname;
            cat = cat.toUpperCase()
            const catcheckimg = await Category.findOne({categoryname:cat.trim()})
            console.log(cat);
            if (cat.trim() == "") {
                req.session.errorMessage = MESSAGES.CATEGORY.ERROR.EMPTY
                res.redirect("/admin/addcategory")
            }
                
            else if (/\d/.test(cat)) { 
                req.session.errorMessage = MESSAGES.CATEGORY.ERROR.HAS_NUMBERS
                res.redirect("/admin/addcategory")      
            }
            else if(catcheckimg){
                req.session.errorMessage = MESSAGES.CATEGORY.ERROR.EXISTS
                res.redirect("/admin/addcategory") 
            }
            else{
                const exist= await Category.findOne({categoryname:cat})
                if(exist){
                    req.session.errorMessage = MESSAGES.CATEGORY.ERROR.DUPLICATE
                    res.redirect("/admin/addcategory")
                }
                else{
                    await Category.create({categoryname:cat})
                    req.session.successMessage = MESSAGES.CATEGORY.SUCCESS.ADDED
                    res.redirect("/admin/category")
                }
            }
        }
        catch(err){
            console.log(err);
        }
    },
    editcategory:async(req,res)=>{
        try{
            const id = req.params.id
            const errorMessage=req.session.errorMessage
            const successMessage = req.session.successMessage
            delete req.session.errorMessage
            delete req.session.successMessage
            const category = await Category.findOne({_id:id})
            res.render("admin/editcategory",{successMessage,errorMessage,id,category})
        }
        catch(err){
            console.log(err);
        }
    },
    posteditcategory:async(req,res)=>{
        try{
            const id = req.params.id
            let cat=req.body.catagoryname;
            cat = cat.toUpperCase()
            const catcheckimg = await Category.findOne({_id:{$ne:id},categoryname:cat.trim()})
            console.log(cat);
            if (cat.trim() == "") {
                req.session.errorMessage = MESSAGES.CATEGORY.ERROR.EMPTY
                res.redirect(`/admin/editcategory/${id}`)
            }
                
            else if (/\d/.test(cat)) { 
                req.session.errorMessage = MESSAGES.CATEGORY.ERROR.HAS_NUMBERS
                res.redirect(`/admin/editcategory/${id}`)      
            }
            else if(catcheckimg){
                req.session.errorMessage = MESSAGES.CATEGORY.ERROR.EXISTS
                res.redirect("/admin/addcategory") 
            }
            else{
                await Category.updateOne({_id:id},{categoryname:cat})
                req.session.successMessage = MESSAGES.CATEGORY.SUCCESS.MODIFIED
                res.redirect("/admin/category")
            }
        }
        catch(err){
            console.log(err);
        }
    },
    ChangeStatusOfcategory:async(req,res)=>{
        try{
            const id=req.params.id
            console.log(id);
            const status=req.params.status
            const result = await Category.findById(id);
            let message;
            if (status == "Show") {
                await Category.updateOne(
                  { _id: id },
                  { $set: { Status: "Hide" } }
                );
                message = MESSAGES.CATEGORY.SUCCESS.HIDE(result.categoryname)
              } else {
                await Category.updateOne(
                  { _id: id },
                  { $set: { Status: "Show" } }
                );
                message = MESSAGES.CATEGORY.SUCCESS.SHOW(result.categoryname)
              }
            res.status(200).json({message});

        }
        catch(err){
            console.log(err);
        }
    }
}
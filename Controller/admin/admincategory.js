const Category=require("../../model/category")

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
                req.session.errorMessage = "category cannot contains spaces!!"
                res.redirect("/admin/addcategory")
            }
                
            else if (/\d/.test(cat)) { 
                req.session.errorMessage = "category cannot contain numbers!"
                res.redirect("/admin/addcategory")      
            }
            else if(catcheckimg){
                req.session.errorMessage = "category already consist!"
                res.redirect("/admin/addcategory") 
            }
            else{
                const exist= await Category.findOne({categoryname:cat})
                if(exist){
                    req.session.errorMessage = "This category also exist"
                    res.redirect("/admin/addcategory")
                }
                else{
                    await Category.create({categoryname:cat})
                    req.session.successMessage = "successfully added the category"
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
            res.render("admin/editcategory",{successMessage,errorMessage,id})
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
            const catcheckimg = await Category.findOne({categoryname:cat.trim()})
            console.log(cat);
            if (cat.trim() == "") {
                req.session.errorMessage = "category contains spaces!!"
                res.redirect(`/admin/editcategory/${id}`)
            }
                
            else if (/\d/.test(cat)) { 
                req.session.errorMessage = "category cannot contain numbers!"
                res.redirect(`/admin/editcategory/${id}`)      
            }
            else if(catcheckimg){
                req.session.errorMessage = "category already consist!"
                res.redirect("/admin/addcategory") 
            }
            else{
                await Category.updateOne({_id:id},{categoryname:cat})
                req.session.successMessage = "successfully modified the category"
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
                message = `successfully hide ${result.categoryname} category for user side`;
              } else {
                await Category.updateOne(
                  { _id: id },
                  { $set: { Status: "Show" } }
                );
                message = `successfully show ${result.categoryname} category for user side`;
              }
            res.status(200).json({message});

        }
        catch(err){
            console.log(err);
        }
    }
}
module.exports={
    userExists:async (req,res,next)=>{
        try{
            if(req.session.logged) res.redirect("/")  
            else next()
        }
        catch(err){
            console.log(err);
        }
    },
    userVerify: async (req,res,next)=>{
        try{
            if(req.session.logged) next()
            else res.redirect("/guest")
        }
        catch(err){ console.log(err);
        }
    },
    adminExists:async (req,res,next)=>{
        try{
            if(req.session.adminlogged) res.redirect("/admin")  
            else next()
        }
        catch(err){
            console.log(err);
        }
    },
    adminVerify:async (req,res,next)=>{
        try{
            if(req.session.adminlogged) next()
            else res.redirect("/admin/login")
        }
        catch(err){
            console.log(err);
        }
    }
}
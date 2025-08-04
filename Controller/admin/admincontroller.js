const MESSAGES = require("../../util/messages");

module.exports={
    loginpage:async (req,res)=>{
        try{
            res.render("admin/login",{err:null})
        }
        catch(err){
            console.log(err);
        }
    },
    postloginpage: async (req,res)=>{
        try{
            const credential={
                email:process.env.ADMIN_EMAIL,
                password:process.env.ADMIN_PASSWORD
            }
            const {email,password}=req.body;
            if(email==credential.email&&password==credential.password){
                req.session.adminlogged=true;
                req.session.adminemail=email;
                res.redirect("/admin");
            }
            else res.render("admin/login",{err:MESSAGES.AUTH.ERROR.INVALID_CREDENTIALS})
        }
        catch(err){
            console.log(err);
        }
    },
    logout:async (req,res)=>{
        try{
            req.session.adminlogged=false;
            res.redirect("/admin")
        }
        catch(err){
            console.log(err);
        }
    }
}
const User=require("../../model/usermodel");
const MESSAGES = require("../../util/messages");
module.exports={
    customerpage:async(req,res)=>{
        try{
            const userdata= await User.find()
            res.render("admin/customer",{customers:userdata})
        }
        catch(err){
            console.log(err);
        }
    },
    customerstatus:async(req,res)=>{
        try{
            const id=req.params.id;
            const status=req.params.status;
            console.log(status);
            var message;
            const user=await User.findOne({_id:id})
            if(status=="1"){
                await User.updateOne({_id:id},{$set:{status:0}})
                message=MESSAGES.USER.SUCCESS.BLOCKED(user.name)
            }
            else{
                await User.updateOne({_id:id},{$set:{status:1}})
                message=MESSAGES.USER.SUCCESS.ACTIVATED(user.name)
            }
            res.json({message:message})
        }
        catch(err){
            console.log(err);
        }
    }
}
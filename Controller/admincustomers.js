const User=require("../model/usermodel")
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
                message=`successfully blocked ${user.name} from this site`
            }
            else{
                await User.updateOne({_id:id},{$set:{status:1}})
                message=`successfully activated ${user.name} from this site`
            }
            res.json({message:message})
        }
        catch(err){
            console.log(err);
        }
    }
}
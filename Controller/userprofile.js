const Addres = require("../model/address");
const User = require("../model/usermodel");
const bcrypt = require("bcrypt")
module.exports={
    profilepage:async (req,res)=>{
        try{
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.successMessage
            delete req.session.errorMessage
            
            const address = await Addres.find()
            res.render("user/profile",{successMessage,errorMessage,username:req.session.username,email:req.session.email,cart:req.session.cart,address})
        }
        catch(err){
            console.log(err);
        }
    },
    getaddress:async (req,res)=>{
        try{
            res.render("user/addaddress")
        }
        catch(err){
            console.log(err);
        }
    },
    postaddress:async (req,res)=>{
        try{
            req.body.userid = req.session._id
            const data = req.body
            await Addres.create({...data});
            const address = await Addres.find()
            req.session.successMessage = "succesfully created address"
            const flag=req.session.addadress
            delete req.session.addadress
            if(flag){
                res.redirect("/placeorder")
            }
            res.redirect("/profile")
        }
        catch(err){
            console.log(err);
        }
    },
    deleteaddress:async(req,res)=>{
        try{
            const id = req.params.id
            await Addres.deleteOne({ _id: id })
            res.json({ message: 'Address deleted successfully' });        }
        catch(err){
            console.log(err);
        }
    },
    geteditaddress:async(req,res)=>{
        try{
            const id=req.params.id
            const data = await Addres.findOne({_id:id})
            console.log(data);
            res.render("user/editaddress",{data})
        }
        catch(err){
            console.log(err);
        }
    },
    editaddress:async (req,res)=>{
        try{
            const adrs = req.body 
            const upload = await Addres.updateOne({...adrs})
            const address = await Addres.find()
            req.session.successMessage = "Address updated successfully"
            if(upload){
                res.redirect("/profile")
            }
        }
        catch(err){
            console.log(err);
        }
    },
    changepassword:async (req,res)=>{
        try{
            const email=req.session.email
            console.log(email);
            const {currentpassword,password}=req.body
            const data = await User.findOne({email:email})
            const isMatch = await bcrypt.compare(currentpassword,data.password)
            if(isMatch){
                const hashpassword = await bcrypt.hash(password,10)
                const upload= await User.updateOne({email:email},{$set:{password:hashpassword}})
                req.session.successMessage="Changed Your password successfully"
                res.redirect("/profile")
            }
            else{
                req.session.errorMessage="Your entering current password is not matching"
                res.redirect("/profile")
            }
        }
        catch(err){
            console.log(err);
        }
    }
}
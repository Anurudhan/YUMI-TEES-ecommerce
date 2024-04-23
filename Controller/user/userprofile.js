const Addres = require("../../model/address");
const User = require("../../model/usermodel");
const Coupon = require("../../model/coupon");
const Wallet = require("../../model/wallet");
const walletHistory = require("../../model/walletHistory")
const bcrypt = require("bcryptjs")
module.exports={
    profilepage:async (req,res)=>{
        try{
            const successMessage = req.session.successMessage
            const errorMessage = req.session.errorMessage
            delete req.session.successMessage
            delete req.session.errorMessage;
            const wish = req.session.wish;
            const [address, coupon, WalletUser,WalletUserHist] = await Promise.all([
                Addres.find({userid:req.session._id}),
                Coupon.find().sort({ _id: -1 }),
                Wallet.findOne({ userid: req.session._id}).populate('invited'),
                walletHistory.findOne({ userId: req.session.user_Id }).sort({ "refund._id": -1 }),
            ])
            const IsuserwalletId=WalletUserHist._id
            const WalletUserHisto = await walletHistory.aggregate([
              { $match: {_id:IsuserwalletId } }, 
              { $unwind: "$refund" }, 
              { $sort: { "refund._id": -1 } }, 
              {
                $group: {
                  _id: "$_id", 
                  userId: { $first: "$userId" }, 
                  refund: { $push: "$refund" }, 
                },
              },
            ]);
            res.render("user/profile",{successMessage,errorMessage,wish,username:req.session.username,
                email:req.session.email,cart:req.session.cart,address,coupon,WalletUser,WalletUserHist,WalletUserHisto})
        }
        catch(err){
            console.log(err);
        }
    },
    resetuserdetails:async (req,res)=>{
        try{
            console.log(req.body);
            const {username,email} = req.body
            console.log(username);
            if(username.trim()===''){
                req.session.errorMessage="username cannot contain only  spaces "
                res.redirect("/profile")
            }
            else if(!/^[a-zA-Z\s]+$/.test(username)){
                req.session.errorMessage="username cannot contain numbers and symbols. Please enter valid values"
                res.redirect("/profile")
            }
            else{
                await User.updateOne({_id:req.session._id},{$set:{name:username,email:email}})
                req.session.successMessage = "successfully modified the your profile"
                res.redirect("/profile")
            }
        }
        catch(err){
            console.log(err);
        }
    },
    getaddress:async (req,res)=>{
        try{
            const flag = req.query.flag
            res.render("user/addaddress",{flag})
        }
        catch(err){
            console.log(err);
        }
    },
    postaddress:async (req,res)=>{
        try{
            req.body.userid = req.session._id
            const data = req.body
            console.log(req.body);
            await Addres.create({...data});
            const address = await Addres.find()
            req.session.successMessage = "succesfully created address"
            console.log(data.flag);
            const flag=data.flag;
            console.log(flag);
            (flag == 1) ? res.redirect("/placeorder") : res.redirect("/profile")
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
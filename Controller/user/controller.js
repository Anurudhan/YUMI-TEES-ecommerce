const OTP = require("../../model/otpmodel");
const User=require("../../model/usermodel");
const Product = require("../../model/productSchema")
const Category = require("../../model/category")
const { sendOTP } = require("../../util/otp");
const {sendResetEmail}=require("../../auth/nodemailerForReset")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const JWT_SECRET = "I AM THE SECRET"
module.exports={
    loginpage:async(req,res)=>{
        try{
            const email_err = req.session.email_err
            const status_err = req.session.status_err
            const pass_err = req.session.pass_err
            const msg=req.session.msg
            delete req.session.msg
            delete req.session.status_err
            delete req.session.pass_err
            delete req.session.email_err
            res.render("user/login",{pass_err,status_err,email_err,msg})
        }
        catch(err){
            console.log(err);
        }
    },
    postlogin:async(req,res)=>{
        try{
            const email=req.body.email;
            const password=req.body.password;
            const userdata=await User.findOne({email:email})
            if(userdata){
                const isMatch= await bcrypt.compare(password,userdata.password)
                if(userdata.status=="1"){
                    if(isMatch){
                        req.session.logged=true;
                        req.session.email=email;
                        req.session.username=userdata.name;
                        res.redirect("/")
                    }
                    else{
                        req.session.pass_err = "Your Password is Incorrect"
                        res.redirect("/login")
                    }
                }
                else{
                    req.session.status_err = "Your account is access deniedd for some issues"
                    res.redirect("/login")
                }
            }
           else{
            req.session.email_err = 'Your never signup in this email ID'
            res.redirect("/login")
        }
        }
        catch(err){
            console.log(err);
        }
    },
    homepage:async(req,res)=>{
        try{
            const products = await Product.find().populate('Category')
            const categories = await Category.find();
            const wish = req.session.wish;
            const mens = products.filter(product => product.Category.categoryname==categories[0].categoryname);
            const womens = products.filter(product => product.Category.categoryname ==categories[1].categoryname );
            const kids = products.filter(product => product.Category.categoryname == categories[2].categoryname);
            if(req.session.logged){
                const user = await User.findOne({email:req.session.email})
                console.log(user);
                const orderreject = user.orderreject
                if(orderreject==true){
                    await User.updateOne({_id:user._id},{$set:{orderreject:false}})
                }
                req.session._id = user._id
                console.log(req.session._id);
                res.render("user/home",{username:req.session.username,cart:req.session.cart,wish,products,mens,womens,kids,orderreject})
            }
            else res.render("user/guesthome",{username:req.session.username,cart:req.session.cart,wish,products,mens,womens,kids})
        }
        catch(err){
            console.log(err);
        }
    },
    getsignuppage:async(req,res)=>{
        try{
            res.render("user/signup")
        }
        catch(err){
            console.log(err);
        }
    },
    postsignuppage:async(req,res)=>{
        try{
            const {status,name,email,password}=req.body;
            console.log(req.body);
            console.log(status,name,email,password)
            const data = await User.findOne({email:email})
            if(data){
                res.render("user/signup",{exists:"This user already exist"})
            }
            else{
                req.session.email=email
                req.session.username=name
                req.session.status=status
                req.session.password=await bcrypt.hash(password,10)

                await sendOTP(email)
                setTimeout(async ()=>{
                    await OTP.deleteOne({email:email})
                },60000)
                res.redirect("/send-otp")
            }
        }
        catch(err){
            console.log(err);
        }
    },
    getotppage:async (req,res)=>{
        try{
            res.render("user/otp",{err:null})
        }
        catch(err){
            console.log(err);
        }

    },
    postotppage:async (req,res)=>{
        try{
            const arr=[]
            const {num1,num2,num3,num4}=req.body
            arr.push(num1)
            arr.push(num2)
            arr.push(num3)
            arr.push(num4)
            const userotp=arr.join("").toString()
            const generateotp= await OTP.findOne({email:req.session.email},{otp:1,_id:0})
            console.log(generateotp);
            if(generateotp.otp==userotp){
                req.session.logged = true;
                const userdata= await User.create({
                    email:req.session.email,
                    name:req.session.username,
                    status:req.session.status,
                    password:req.session.password
                })
                res.redirect("/")
            }
            else res.redirect("/invalid_otp")
        }
        catch(err){
            console.log(err);
        }
    },
    resendotp:async (req,res)=>{
        try{
            await sendOTP(req.session.email)
            setTimeout(async ()=>{
                await OTP.deleteOne({email:req.session.email})
            },60000)
            res.redirect("/send-otp")
        }
        catch(err){
            console.log(err);
        }
    },
    invalidotp:async (req,res)=>{
        try{
            res.render("user/otp",{err:"your insert the otp is invalid otp"})
        }
        catch(err){
            console.log(err);
        }
    },
    verifyemail:async (req,res)=>{
        try{
            const msg = req.session.msg
            delete req.session.msg
            req.session.verifyemail=true
            res.render("user/verifyemail",{msg})
        }
        catch(err){
            console.log(err);
        }
    },
    postverifyemail:async (req,res)=>{
        try{
            const email = req.body.email
            const user = await User.findOne({email:email})
            if(user == null){
                req.session.msg = "This Email not exist please SignUp"
                res.redirect("/verifyemail")  
            }
            const secret = JWT_SECRET + user.password
            const payload = {
                email:user.email,
                id:user._id
            }
            const token = jwt.sign(payload,secret,{expiresIn:'10m'})
            const link =`http://localhost:3000/resetpassword/${user._id}/${token}`
            console.log(link);
            sendResetEmail(user.email,link)
            req.session.msg = "Password reset link has been sent to your Email"
            res.redirect("/verifyemail")

        }
        catch(err){
            console.log(err);
        }
    },
    getresetpassword:async(req,res)=>{
        try{
            const {id,token}=req.params
            const user = await User.findOne({_id:id})
            if(user == null){
                req.session.msg = "Invalid user email this"
                res.redirect("/verifyemail")
            }
            const secret = JWT_SECRET+user.password
            const payload = jwt.verify(token,secret)
            res.render("user/resetpassword",{id:user._id})
        }
        catch(err){
            console.log(err);
            req.session.msg="This is invalid link"
            res.redirect("/login")
        }
    },
    resetpassword:async(req,res)=>{
        try{
            const {id,password}=req.body
            const hashpassword = await bcrypt.hash(password,10)
            await User.updateOne({_id:id},{$set:{password:hashpassword}})
            req.session.verifyemail=false
            if(req.session.logged){
                req.session.successMessage="The password reset succesfully"
                res.redirect("/profile")
            }
            req.session.msg="The password reset succesfully"
            res.redirect("/login")
        }
        catch(err){
            console.log(err);
        }
    },
    logout:async (req,res)=>{
        try{
            req.session.logged = false;
            res.redirect("/")
        }
        catch(err){
            console.log(err);
        }
    }
}
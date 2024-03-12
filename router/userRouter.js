const express = require('express');
const router=express()
const path=require('path');
const usercontoller = require("../Controller/controller")
const productcontroller = require("../Controller/userproduct")
const profilecontroller = require("../Controller/userprofile")
const cartcontroller=require("../Controller/cart")
const ordercontroller = require("../Controller/order")
const {CountOfCart}=require("../middleware/cartCount")
const {userVerify,userExists}=require("../middleware/session")

// Home page
router.get("/",CountOfCart,usercontoller.homepage)
router.get("/home",userExists,userVerify)

// Login page

router.get("/login",userExists,usercontoller.loginpage)
router.post("/login",usercontoller.postlogin)
router.get("/verifyemail",usercontoller.verifyemail)
router.post("/verifyemail",usercontoller.postverifyemail)
router.get("/resetpassword/:id/:token",usercontoller.getresetpassword)
router.post("/resetpassword",usercontoller.resetpassword)


// Sign-Up and OTP page
router.get("/signup",userExists,usercontoller.getsignuppage)
router.post("/signup",usercontoller.postsignuppage)
router.get("/send-otp",userExists,usercontoller.getotppage)
router.post("/get-otp",usercontoller.postotppage)
router.get("/resendOtp",userExists,usercontoller.resendotp)
router.get("/invalid_otp",userExists,usercontoller.invalidotp)

// cart 

router.get("/addtocart/:id/:change",userVerify,cartcontroller.addcart)
router.get("/cart",userVerify,CountOfCart,cartcontroller.cartpage)
router.delete("/removecart/:prdktId",userVerify,cartcontroller.removeCart)
router.get("/nocart",userVerify,cartcontroller.nocart)

// order

router.get("/placeorder",userVerify,CountOfCart,ordercontroller.getplaceorder)
router.get("/getaddress/:id",userVerify,ordercontroller.getaddress)
router.post("/placeorder/:type",userVerify,ordercontroller.confirmorder)
router.get("/userorder",userVerify,ordercontroller.getorder)
router.get("/vieworderdetails/:id",userVerify,ordercontroller.getorderdetails)
// product views in user side

router.get("/allproduct",userVerify,CountOfCart,productcontroller.getallproduct)
router.get("/uniqueproduct/:id",userVerify,CountOfCart,productcontroller.uniqueproduct)
router.get("/searchproduct",userVerify,productcontroller.searchproduct)
router.post("/filter",userVerify,productcontroller.getallproduct)
router.get("/filter",userVerify,productcontroller.getallproduct)
// user-profile 
router.get("/profile",userVerify,CountOfCart,profilecontroller.profilepage)
router.get("/addaddress",userVerify,profilecontroller.getaddress)
router.post("/addaddress",userVerify,profilecontroller.postaddress)
router.delete("/deleteAddress/:id",userVerify,profilecontroller.deleteaddress)
router.get("/editAddress/:id",userVerify,profilecontroller.geteditaddress)
router.post("/editaddress",userVerify,profilecontroller.editaddress)
router.post("/changepassword",userVerify,profilecontroller.changepassword)

// log-out 
router.get("/logout",usercontoller.logout)


module.exports=router
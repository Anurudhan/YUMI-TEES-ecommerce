const express = require('express');
const router=express()
const path=require('path');
const usercontoller = require("../Controller/user/controller")
const productcontroller = require("../Controller/user/userproduct")
const profilecontroller = require("../Controller/user/userprofile")
const cartcontroller=require("../Controller/user/cart")
const ordercontroller = require("../Controller/user/order")
const wishlistcontroller =  require("../Controller/user/whishlist")
const {CountOfCart}=require("../middleware/cartCount");
const {wishCount} = require("../middleware/wishCount");
const {userVerify,userExists}=require("../middleware/session")

// Home page
router.get("/",CountOfCart,wishCount,usercontoller.homepage)
router.get("/home",userExists,userVerify,CountOfCart,wishCount)

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

router.get("/addtocart/:id/:change",userVerify,CountOfCart,wishCount,cartcontroller.addcart)
router.get("/cart",userVerify,CountOfCart,wishCount,cartcontroller.cartpage)
router.delete("/removecart/:prdktId",userVerify,CountOfCart,wishCount,cartcontroller.removeCart)
router.get("/nocart",userVerify,CountOfCart,wishCount,cartcontroller.nocart)

// Whishlist

router.get("/wishlist",userVerify,CountOfCart,wishCount,wishlistcontroller.getwishlist);
router.post("/addtowishlist/:prdktId",userVerify,CountOfCart,wishCount,wishlistcontroller.addToWishlist)
router.post("/removewishlist/:prdktid/:wishId",userVerify,CountOfCart,wishCount,wishlistcontroller.removeFromWishlist);
router.get("/nowishlist",userVerify,CountOfCart,wishCount,wishlistcontroller.noWishlist)

// order

router.get("/placeorder",userVerify,CountOfCart,wishCount,ordercontroller.getplaceorder);
router.get("/getaddress/:id",userVerify,CountOfCart,wishCount,ordercontroller.getaddress);
router.post("/placeorder/:type",userVerify,CountOfCart,wishCount,ordercontroller.confirmorder);
router.post("/verifypayment",userVerify,CountOfCart,wishCount,ordercontroller.verifypayment);
router.get("/userorder",userVerify,CountOfCart,wishCount,ordercontroller.getorder);
router.get("/vieworderdetails/:id",CountOfCart,wishCount,userVerify,ordercontroller.getorderdetails);
router.post("/cancellallorder/:id",userVerify,CountOfCart,wishCount,ordercontroller.cancelallorder);
router.post("/cancelsingleorder/:id/:index",userVerify,CountOfCart,wishCount,ordercontroller.cancelsingleorder);
router.post("/returnorder",userVerify,CountOfCart,wishCount,ordercontroller.returnorder);
router.get("/ordersuccess",userVerify,CountOfCart,wishCount,ordercontroller.ordersucess);
router.get("/failedpayment",userVerify,CountOfCart,wishCount,ordercontroller.paymentFailed)
router.post("/couponapply",userVerify,CountOfCart,wishCount,ordercontroller.couponapply);
router.post("/removecouponapply",userVerify,CountOfCart,wishCount,ordercontroller.removecouponaply);
router.get("/repaymentOnline/:id",userVerify,CountOfCart,wishCount,ordercontroller.repayment)

// Invoice 

router.get("/generateinvoice/:orderId/:index",userVerify,CountOfCart,ordercontroller.generateinvoice);
router.get("/downloadinginvoice/:orderId",userVerify,CountOfCart,ordercontroller.downloadinvoice)


// product views in user side

router.get("/allproduct",userVerify,CountOfCart,wishCount,productcontroller.getProducts)
router.get("/uniqueproduct/:id",userVerify,CountOfCart,wishCount,productcontroller.uniqueproduct)
router.get("/searchproduct", (req, res) => {
    res.redirect(`/allproduct?search=${encodeURIComponent(req.query.search || '')}`);
});
router.post("/filter",userVerify,CountOfCart,wishCount,productcontroller.getProducts)
router.get("/filter",userVerify,CountOfCart,wishCount,productcontroller.getProducts)
router.get("/searchfilter",userVerify,CountOfCart,wishCount,productcontroller.getProducts)

// user-profile 
router.get("/profile",userVerify,CountOfCart,wishCount,profilecontroller.profilepage)
router.post("/resetuserdetails",userVerify,profilecontroller.resetuserdetails)
router.get("/addaddress",userVerify,profilecontroller.getaddress)
router.post("/addaddress",userVerify,profilecontroller.postaddress)
router.delete("/deleteAddress/:id",userVerify,profilecontroller.deleteaddress)
router.get("/editAddress/:id",userVerify,profilecontroller.geteditaddress)
router.post("/editaddress",userVerify,profilecontroller.editaddress)
router.post("/changepassword",userVerify,profilecontroller.changepassword)

// log-out 
router.get("/logout",usercontoller.logout)


module.exports=router
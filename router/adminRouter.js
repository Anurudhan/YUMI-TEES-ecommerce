const express = require('express');
const {adminExists,adminVerify}=require("../middleware/session");
const upload=require("../middleware/multer")
const dashboardcontroller = require("../Controller/admin/admindashboard")
const admincontroller=require("../Controller/admin/admincontroller")
const productcontroller=require("../Controller/admin/adminproduct")
const categorycontroller=require("../Controller/admin/admincategory")
const customercontroller=require("../Controller/admin/admincustomers")
const ordercontroller = require("../Controller/admin/adminorder")
const bannercontroller = require("../Controller/admin/asminbanner")
const couponcontroller = require('../Controller/admin/admincoupon');
const router=express();

// login and home page ------------------------------------------------>

router.get("/",adminVerify,dashboardcontroller.getdashboard)
router.get("/login",adminExists,admincontroller.loginpage)
router.post("/login",admincontroller.postloginpage)
router.get("/logout",admincontroller.logout)

// product maintain----------------------------------------------------->

const uploadfields = [
    {name:"image1",maxCount:1},
    {name:"image2",maxCount:1},
    {name:"image3",maxCount:1},
    {name:"image4",maxCount:1}
]
router.get("/product",adminVerify,productcontroller.productlist)
router.get("/addproducts",adminVerify,productcontroller.addproduct)
router.post("/addproducts",upload.fields(uploadfields),productcontroller.postaddproduct);
router.get("/blockproduct/:id/:status",adminVerify,productcontroller.listproduct)
router.get("/editproduct/:id",adminVerify,productcontroller.geteditproduct)
router.post("/editProducts/:id",upload.any(),productcontroller.editproduct)
router.get("/deleteImage/:id/:index",adminVerify,productcontroller.deleteimage)
router.delete("/product/:id",productcontroller.deleteproduct)

// category maintain---------------------------------------------------->

router.get("/category",adminVerify,categorycontroller.categorypage)
router.get("/addcategory",adminVerify,categorycontroller.addcategory)
router.post("/addcatagory",categorycontroller.postaddcategory)
router.get("/editcategory/:id",categorycontroller.editcategory)
router.post("/editcatagory/:id",categorycontroller.posteditcategory)
router.post("/blockcategory/:id/:status",categorycontroller.ChangeStatusOfcategory)

// customer maintain----------------------------------------------------->

router.get("/customers",adminVerify,customercontroller.customerpage)
router.get("/customers/block/:id/:status",adminVerify,customercontroller.customerstatus)

// order maintain--------------------------------------------------------->

router.get("/orders",adminVerify,ordercontroller.getorder)
router.get("/orderdetails/:id",adminVerify,ordercontroller.getorderdetails)
router.post("/updateorderstatus/:id/:status",adminVerify,ordercontroller.orderstatuschanging)
router.get("/returndetails/:id",adminVerify,ordercontroller.getreturnrequest)
router.post("/approveReturn",adminVerify,ordercontroller.returnapproove)
router.post("/rejectReturn",adminVerify,)

// coupon management-------------------------------------------------------->

router.get("/coupons",adminVerify,couponcontroller.getcoupon)
router.get("/coupon/:id",adminVerify,couponcontroller.coupon)
router.post("/addcoupon",adminVerify,couponcontroller.addcoupon)
router.put("/editcoupon/:id",adminVerify,couponcontroller.editcoupon)
router.delete("/deletecoupon/:id",adminVerify,couponcontroller.deleteCoupon)

// banner manage--------------------------------------------------------->

router.get("/banner",adminVerify,bannercontroller.getbanner)

// download salesreport-------------------------------------------------------->

router.post("/downloadsales",adminVerify,dashboardcontroller.downloadsalesreport)






module.exports=router
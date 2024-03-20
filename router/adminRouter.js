const express = require('express');
const {adminExists,adminVerify}=require("../middleware/session");
const upload=require("../middleware/multer")
const admincontroller=require("../Controller/admincontroller")
const productcontroller=require("../Controller/adminproduct")
const categorycontroller=require("../Controller/admincategory")
const customercontroller=require("../Controller/admincustomers")
const ordercontroller = require("../Controller/adminorder")
const bannercontroller = require("../Controller/asminbanner")
const router=express();

// login and home page ------------------------------------------------>

router.get("/",adminVerify,admincontroller.dashboardpage)
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
// banner manage--------------------------------------------------------->

router.get("/banner",adminVerify,bannercontroller.getbanner)






module.exports=router
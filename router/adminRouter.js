const express = require('express');
const {adminExists,adminVerify}=require("../middleware/session");
const upload=require("../middleware/multer")
const admincontroller=require("../Controller/admincontroller")
const productcontroller=require("../Controller/adminproduct")
const categorycontroller=require("../Controller/admincategory")
const customercontroller=require("../Controller/admincustomers")
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
router.delete("/categories/:id/:name",categorycontroller.deletecategory)

// customer maintain----------------------------------------------------->

router.get("/customers",adminVerify,customercontroller.customerpage)
router.get("/customers/block/:id/:status",adminVerify,customercontroller.customerstatus)








module.exports=router
const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const userRouter=require("./router/userRouter")
const adminRouter=require("./router/adminRouter")
const path = require('path');
const session = require('express-session');
const flash = require("connect-flash")
const nocahe= require('nocache');
const app=express()

// nocache---------------------------------------------------------------->

app.use(nocahe())
// ----------------------------------------------------------------------->
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(path.join(__dirname,"public/assets")))

// configure express-session middleware----------------------------------->
app.use(session({
    secret: "nocahe", 
    resave: true,
    saveUninitialized: true
}));

// flash
app.use(flash());

// set view engine

app.set('view engine', 'ejs');

// server to connecting admin and user--------------------------------------->

app.use("/", userRouter)
app.use("/admin", adminRouter)

// mongoose connection------------------------------------------------------->

mongoose.connect(process.env.MONGOURL,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{console.log("MongoDB connected")})
.catch((err)=>{console.log("MongoDB not connected",err);})

// server connection---------------------------------------------------------->

app.listen(3000,()=>{console.log("server connected succesfully");})
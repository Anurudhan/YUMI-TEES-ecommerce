const Category = require("../model/category");
const product = require("../model/productSchema");
module.exports = {
  productlist: async (req, res) => {
    try {
      const data = await product.find().populate('Category');
      console.log(data);
      if (req.query.message) {
        let msg = req.query.message;
        res.render("admin/product", { data, message: msg });
      } else res.render("admin/product", { data, message: null });
    } catch (err) {
      console.log(err);
    }
  },
  addproduct: async (req, res) => {
    try {
      const category = await Category.find();
      req.session.category=category
      res.render("admin/addproduct", { category: category});
    } catch (err) {
      console.log(err);
    }
  },
  postaddproduct: async (req, res) => {
    try {
      const fieldsfile = req?.files;
      const productdetails = req.body;
      let images = [
        fieldsfile.image1[0].filename,
        fieldsfile.image2[0].filename,
        fieldsfile.image3[0].filename,
        fieldsfile.image4[0].filename,
      ];
      const Product = { ...productdetails, images };
      await product.create(Product);
      res.redirect("/admin/product");
    } catch (err) {
      console.log(err);
    }
  },
  listproduct: async (req, res) => {
    try {
      const { id, status } = req.params;
      const productDocument = await product.findOne({ _id: id });
      if (status == "Show") {
        await product.updateOne(
          { _id: id },
          { $set: { displayStatus: "hide" } }
        );
        message = `successfully hide ${productDocument.productName} for user side`;
      } else {
        await product.updateOne(
          { _id: id },
          { $set: { displayStatus: "Show" } }
        );
        message = `successfully show ${productDocument.productName} for user side`;
      }
      res.redirect(`/admin/product?message=${message}`);
    } catch (err) {
      console.log(err);
    }
  },
  geteditproduct: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.find();
      const Product = await product.findOne({ _id: id }).populate('Category');
      res.render("admin/editproduct", { category: category, product: Product });
    } catch (err) {
      console.log(err);
    }
  },
  deleteproduct:async (req,res)=>{
    try{
      const id=req.params.id;
      const result = await product.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).send('Category not found');
      }
      res.sendStatus(200);
    }
    catch(err){
      console.log(err);
    }
  },
  deleteimage: async (req, res) => {
    try {
      const productId = req.params.id;
      const index = req.params.index;
      console.log(productId, "index : ", index);
      const Product = await product.findOne({ _id: productId });
      if (!Product) {
        return res.status(404).send("Product is not found");
      }

      const update = await product.updateOne(
        { _id: productId },
        { $pull: { images: index } }
      );
      res.json({ success: true });
    } catch (err) {
      console.log(err);
    }
  },
  editproduct: async (req, res) => {
    try {
      const id = req.params.id;
      const images = [];
      const Product = await product.findOne({ _id: id });
      if (Product) {
        images.push(...Product.images);
      }
      //   retrieve image pos and add -------------
      for (let i = 0; i < 5; i++) {
        if (req.files[i]) {
          console.log("okkkk");
          let position = req.files[i].fieldname.split("");
          images[position[5] - 1] = req.files[i].filename;
        }
      }
      // end image ------------------------------------

      const UpdatedProducts = req.body;
      console.log(UpdatedProducts);
      console.log("stop------------------------------------------->");

      // upload file to -------------------------------
      const uploaded = await product.updateOne(
        { _id: id },
        { ...UpdatedProducts, images }
      );
      if (uploaded) {
        res.redirect("/admin/product");
      }
    } catch (err) {
      console.log(err);
    }
  },
};

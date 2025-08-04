const User = require("../../model/usermodel")
const Cart = require("../../model/cartmodel")
const Product = require("../../model/productSchema");
const MESSAGES = require("../../util/messages");


module.exports = {
    cartpage: async (req, res) => {
        try {
            const useremail = req.session.email;
            const username = req.session.username;
            const wish = req.session.wish;
            const page = parseInt(req.query.page) || 1;
            const itemsPerPage = 5;
            
            const user = await User.findOne({ email: useremail });
            const kart = await Cart.findOne({ userid: user._id }).populate({
                path: "products.productid",
                populate: { path: 'Category', model: 'category' }
            });

            if (kart != null && kart != undefined) {
                const carts = kart.products;
                const totalItems = carts.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                // Ensure page is within valid range
                const currentPage = Math.max(1, Math.min(page, totalPages));
                
                // Slice the carts array for pagination
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedCarts = carts.slice(startIndex, startIndex + itemsPerPage);

                let grandtotal = 0;
                let disctotal = 0;
                carts.forEach((cur) => {
                    grandtotal += cur.productid.price * cur.quantity;
                    disctotal += cur.productid.discountAmount * cur.quantity;
                });

                req.session.grandtotal = grandtotal;
                req.session.disctotal = disctotal;
                totalprice = grandtotal - disctotal;
                req.session.totalprice = totalprice;

                if (carts.length > 0) {
                    res.render("user/cart", {
                        username,
                        cart: req.session.cart,
                        wish,
                        carts: paginatedCarts,
                        grandtotal,
                        disctotal,
                        totalprice,
                        page: currentPage,
                        totalPages
                    });
                } else {
                    res.redirect("/nocart");
                }
            } else {
                res.redirect("/nocart");
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error");
        }
    },
    nocart: async (req, res) => {
        try {
            const username = req.session.username;
            const cart = req.session.cart;
            const wish = req.session.wish;
            res.render("user/nocart", { cart, username, wish, errorMessage: MESSAGES.CART.ERROR.EMPTY })
        } catch (err) {
            console.log(err);
        }
    },
   addcart: async (req, res) => {
        try {
            const userEmail = req.session.email;
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }
            const userId = user._id;
            const productId = req.params.id;
            const change = parseInt(req.params.change); // Ensure change is an integer

            const product = await Product.findOne({ _id: productId });
            if (!product) {
                return res.status(404).json({ msg: "Product not found" });
            }

            if (product.stockQuantity === 0) {
                return res.status(400).json({ msg: MESSAGES.PRODUCT.ERROR.OUT_OF_STOCK });
            }

            let cart = await Cart.findOne({ userid: userId });
            let isExistingProduct = false;

            if (!cart) {
                // Create new cart if none exists
                const cartData = {
                    userid: userId,
                    products: [{ productid: productId, quantity: 1 }],
                };
                cart = await Cart.create(cartData);
                req.session.cart = cart;
            } else {
                const productInCart = cart.products.find(
                    (p) => p.productid.toString() === productId
                );
                if (productInCart) {
                    isExistingProduct = true;
                    const newQuantity = productInCart.quantity + change;
                    if (newQuantity < 1 || newQuantity > 5 || newQuantity > product.stockQuantity) {
                        return res.status(400).json({
                            msg: `Quantity must be between 1 and ${Math.min(5, product.stockQuantity)}`,
                        });
                    }
                    await Cart.updateOne(
                        { userid: userId, "products.productid": productId },
                        { $inc: { "products.$.quantity": change } }
                    );
                } else {
                    await Cart.updateOne(
                        { userid: userId },
                        { $push: { products: { productid: productId, quantity: 1 } } }
                    );
                }
                // Refresh cart data
                cart = await Cart.findOne({ userid: userId });
                req.session.cart = cart;
            }

            // Recalculate totals
            const populatedCart = await Cart.findOne({ userid: userId }).populate(
                "products.productid",
                "price discountAmount stockQuantity"
            );
            let grandtotal = 0;
            let disctotal = 0;
            for (const item of populatedCart.products) {
                const product = item.productid;
                const quantity = item.quantity;
                const price = product.price;
                const discount = product.discountAmount || 0;
                grandtotal += price * quantity;
                disctotal += discount * quantity;
            }

            // Update session
            req.session.grandtotal = grandtotal;
            req.session.disctotal = disctotal;
            req.session.totalprice = grandtotal - disctotal;

            // Send response
            res.json({
                msg: isExistingProduct
                    ? MESSAGES.CART.SUCCESS.QUANTITY_UPDATED
                    : MESSAGES.CART.SUCCESS.NEW_PRODUCT_ADDED,
                grandtotal,
                disctotal,
                totalprice: grandtotal - disctotal,
                cart: populatedCart, // Optional: include updated cart for client-side validation
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server error" });
        }
    },
    removeCart: async (req, res) => {
        try {
            console.log("hi------------------->");
            await Cart.updateOne({ userid: req.session._id }, { $pull: { products: { productid: req.params.prdktId.trim() } } })           
            res.json({ msg: MESSAGES.CART.SUCCESS.REMOVED })
        } catch (err) {
            console.log(err);
        }
    }
}
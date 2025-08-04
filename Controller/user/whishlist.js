const Product = require('../../model/productSchema');
const User = require('../../model/usermodel');
const Wishlist = require('../../model/wishlist');
const Cart = require('../../model/cartmodel');
const MESSAGES = require('../../util/messages');


module.exports = {
    getwishlist: async (req, res) => {
        try {
            const username = req.session.username;
            const cart = req.session.cart;
            const wish = req.session.wish;
            const [wishli, carts] = await Promise.all([
                Wishlist.findOne({ userid: req.session._id }).populate(
                    { path: "products.productid", populate: [{ path: 'Category', model: 'category' }] }),
                Cart.findOne({ userid: req.session._id }).populate("products.productid")
            ]);
            let prdktCheck = [];
            if (wishli != null && wishli.products.length != 0) {
                if (carts && carts.products) {
                    prdktCheck = wishli.products.map(wishlistProduct => {
                        wishlistProduct.inCart = carts.products.some(cartProduct => cartProduct.productid._id.equals(wishlistProduct.productid._id));
                        return wishlistProduct.inCart;
                    });
                } else {
                    prdktCheck = Array(wishli.products.length).fill(false);
                }
                res.render('user/wishlist', { username, wish, wishli, prdktCheck, cart });
            } else {
                console.log("jvbjhss hdcbhjb");
                res.redirect("/nowishlist");
            }
        } catch (err) {
            console.log(err);
        }
    },
    addToWishlist: async (req, res) => {
        try {
            console.log(req.params);
            const usr = await User.findOne({ email: req.session.email });
            if (usr) {
                const wishlst = await Wishlist.findOne({ userid: usr._id });
                if (wishlst) {
                    const data = await Wishlist.findOne({ userid: usr._id, 'products.productid': req.params.prdktId });
                    if (data) {
                        res.json({ errorMsg: MESSAGES.WISHLIST.ERROR.ALREADY_EXISTS });
                    } else {
                        await Wishlist.updateOne({ userid: usr._id }, { $push: { products: { productid: req.params.prdktId } } });
                        res.json({ successMsg: MESSAGES.WISHLIST.SUCCESS.ADDED });
                    }
                } else {
                    const wishData = {
                        userid: usr._id,
                        products: [{ productid: req.params.prdktId }]
                    };
                    await Wishlist.create(wishData);
                    res.json({ successMsg: MESSAGES.WISHLIST.SUCCESS.ADDED });
                }
            } else {
                res.json({ errorMsg: MESSAGES.WISHLIST.ERROR.USER_NOT_FOUND });
            }
        } catch (error) {
            console.log(error);
        }
    },
    removeFromWishlist: async (req, res) => {
        try {
            console.log(req.params);
            const { prdktid, wishId } = req.params;
            await Wishlist.updateOne({ _id: wishId }, { $pull: { products: { productid: prdktid.trim() } } });
            res.json({ msg: MESSAGES.WISHLIST.SUCCESS.REMOVED });
        } catch (error) {
            console.log(error);
        }
    },
    noWishlist: (req, res) => {
        try {
            const username = req.session.username;
            const cart = req.session.cart;
            const wish = req.session.wish;
            console.log("hllpdjls");
            res.render('user/nowishlist', { username, cart, wish, errorMessage: MESSAGES.WISHLIST.ERROR.EMPTY });
        } catch (error) {
            console.log(error);
        }
    }
};
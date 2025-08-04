const Addres = require("../../model/address");
const User = require("../../model/usermodel");
const Coupon = require("../../model/coupon");
const Wallet = require("../../model/wallet");
const walletHistory = require("../../model/walletHistory");
const bcrypt = require("bcryptjs");
const MESSAGES = require("../../util/messages");

module.exports = {
    profilepage: async (req, res) => {
        try {
            const successMessage = req.session.successMessage;
            const errorMessage = req.session.errorMessage;
            delete req.session.successMessage;
            delete req.session.errorMessage;
            const wish = req.session.wish;
            const [address, coupon, WalletUser, WalletUserHist] = await Promise.all([
                Addres.find({ userid: req.session._id }),
                Coupon.find().sort({ _id: -1 }),
                Wallet.findOne({ userid: req.session._id }).populate('invited'),
                walletHistory.findOne({ userid: req.session._id }),
            ]);
            const walletHisto = WalletUserHist ? WalletUserHist.refund.sort((a, b) => a - b) : "";
            console.log(WalletUserHist, "result---------------->");
            res.render("user/profile", {
                successMessage,
                errorMessage,
                wish,
                username: req.session.username,
                email: req.session.email,
                cart: req.session.cart,
                address,
                coupon,
                WalletUser,
                WalletUserHist,
                walletHisto
            });
        } catch (err) {
            console.log(err);
        }
    },
    resetuserdetails: async (req, res) => {
        try {
            console.log(req.body);
            const { username, email } = req.body;
            console.log(username);
            if (username.trim() === '') {
                req.session.errorMessage = MESSAGES.USER.ERROR.EMPTY_USERNAME;
                res.redirect("/profile");
            } else if (!/^[a-zA-Z\s]+$/.test(username)) {
                req.session.errorMessage = MESSAGES.USER.ERROR.INVALID_USERNAME;
                res.redirect("/profile");
            } else {
                await User.updateOne({ _id: req.session._id }, { $set: { name: username, email: email } });
                req.session.successMessage = MESSAGES.USER.SUCCESS.PROFILE_UPDATED;
                res.redirect("/profile");
            }
        } catch (err) {
            console.log(err);
        }
    },
    getaddress: async (req, res) => {
        try {
            const flag = req.query.flag;
            res.render("user/addaddress", { flag });
        } catch (err) {
            console.log(err);
        }
    },
    postaddress: async (req, res) => {
        try {
            req.body.userid = req.session._id;
            const data = req.body;
            console.log(req.body);
            await Addres.create({ ...data });
            const address = await Addres.find();
            req.session.successMessage = MESSAGES.ADDRESS.SUCCESS.CREATED;
            console.log(data.flag);
            const flag = data.flag;
            console.log(flag);
            (flag == 1) ? res.redirect("/placeorder") : res.redirect("/profile");
        } catch (err) {
            console.log(err);
        }
    },
    deleteaddress: async (req, res) => {
        try {
            const id = req.params.id;
            await Addres.deleteOne({ _id: id });
            res.json({ message: MESSAGES.ADDRESS.SUCCESS.DELETED });
        } catch (err) {
            console.log(err);
        }
    },
    geteditaddress: async (req, res) => {
        try {
            const id = req.params.id;
            const data = await Addres.findOne({ _id: id });
            console.log(data);
            res.render("user/editaddress", { data });
        } catch (err) {
            console.log(err);
        }
    },
    editaddress: async (req, res) => {
        try {
            const adrs = req.body;
            const upload = await Addres.updateOne({ ...adrs });
            const address = await Addres.find();
            req.session.successMessage = MESSAGES.ADDRESS.SUCCESS.UPDATED;
            if (upload) {
                res.redirect("/profile");
            }
        } catch (err) {
            console.log(err);
        }
    },
    changepassword: async (req, res) => {
        try {
            const email = req.session.email;
            console.log(email);
            const { currentpassword, password } = req.body;
            const data = await User.findOne({ email: email });
            const isMatch = await bcrypt.compare(currentpassword, data.password);
            if (isMatch) {
                const hashpassword = await bcrypt.hash(password, 10);
                await User.updateOne({ email: email }, { $set: { password: hashpassword } });
                req.session.successMessage = MESSAGES.USER.SUCCESS.PASSWORD_CHANGED;
                res.redirect("/profile");
            } else {
                req.session.errorMessage = MESSAGES.AUTH.ERROR.INVALID_CREDENTIALS;
                res.redirect("/profile");
            }
        } catch (err) {
            console.log(err);
        }
    }
};
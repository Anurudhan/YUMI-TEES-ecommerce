const Razorpay = require('razorpay');
const MESSAGES = require('../../util/messages');

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

const createOrder = (req, res, orderid) => {
    console.log('this is ', orderid);
    try {
        let total;
        if (req.session.rePaytotal) {
            total = req.session.rePaytotal + req.session.deliverycharge;
            console.log(total);
            delete req.session.rePaytotal;
            delete req.session.deliverycharge;
        } else {
            total = req.session.totalprice + req.session.deliverycharge;
            delete req.session.deliverycharge;
            console.log(total);
        }
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: orderid,
        };
        console.log("Request Options:", options);
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.error("Razorpay Error:", err);
                res.status(500).send(MESSAGES.ORDER.ERROR.PAYMENT_FAILED);
            } else {
                console.log("Order created successfully:", order);
                res.json({ order: order, paymentMethod: "online", message: MESSAGES.ORDER.SUCCESS.PLACED("Online Payment") });
            }
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).send(MESSAGES.ORDER.ERROR.PAYMENT_FAILED);
    }
};

module.exports = {
    createOrder
};
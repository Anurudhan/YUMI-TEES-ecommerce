const razorpay = require('razorpay');
const dotenv = require('dotenv').config()

var instance = new razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

const createOrder = (req, res, orderid) => {
    console.log('this uis ');
    try {
        const total = req.session.grandtotal-req.session.disctotal;
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: orderid,
        };
        console.log("Request Options:", options);
        instance.orders.create(options, function (err, order) {

            if (err) {
                console.error("Razorpay Error:", err);
                res.status(500).send("Error in creating order");
                // res.json({ status: false, err: err, method: 'online' });
            } else {
                console.log("Order created successfully:", order);
                res.json({order:order,payMthd:"online"});
            }
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).send("Error in creating order");
    }
};

module.exports = {
    createOrder
}
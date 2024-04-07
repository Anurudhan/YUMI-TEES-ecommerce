const Order = require("../../model/order")
const User = require("../../model/usermodel")
const { generateSalesPDF } = require("../../util/generatesalespdfcreator");
const pdf =  require("../../util/generatesalesreportcreator")
const moment  =  require("moment")

module.exports = {
    getdashboard:async(req,res)=>{
        try{
            const [sales, revenue, customers, recentOrders, topSelling] = await Promise.all([
                Order.aggregate([
                    { $match: { orderStatus: "Order Delivered" } },
                    { $group: { _id: null, totalSalesCount: { $sum: 1 } } }]),

                Order.aggregate([
                    { $match: { PaymentStatus: "Paid" } },
                    { $group: { _id: null, totalDiscountAmount: { $sum: "$totalAmount" } } }]),

                User.find().countDocuments(),
                Order.find().sort({ orderDate: -1 }).limit(6),
                Order.aggregate([
                    { $unwind: "$products" },
                    { $group: { _id: '$products.productid', totalQuantity: { $sum: '$products.quantity' } } },
                    { $lookup: { from: 'product', localField: '_id', foreignField: '_id', as: 'productInfo' } },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 5 },
                    { $project: { _id: 1, totalQuantity: 1, productInfo: { $arrayElemAt: ['$productInfo', 0] } } }
                ])

            ])

            const totalSales = sales[0] ? sales[0].totalSalesCount : 0;
            const totalRevenue = revenue[0] ? revenue[0].totalDiscountAmount : 0;

            res.render('admin/dashboard', { totalSales, totalRevenue, customers, recentOrders, topSelling })

        }
        catch(err){
            console.log(err);
        }
    },
    downloadsalesreport : async(req,res)=>{
        try{
            let { startDate, endDate, interval, downloadformat } = req.body;
            console.log(startDate, endDate, interval, downloadformat);
            
            let currentDate; // Declare currentDate outside the if-else block
            
            if (startDate != "") {
                currentDate = endDate;
                console.log(currentDate);
            } else {
                console.log("jghdgfdsf");
                currentDate = new Date();
                startDate = new Date(currentDate);
                if (interval === 'week') {
                    startDate.setDate(currentDate.getDate() - currentDate.getDay());
                    startDate.toISOString();
                } else if (interval === 'month') {
                    startDate.setDate(1);
                    startDate.toISOString();
                } else if (interval === 'year') {
                    startDate.setMonth(0, 1);
                    startDate.toISOString();
                }
            }
            console.log(startDate,"kghjjgjhgfchgfdgfdgdfxgfsdfgd");
            const orders = await Order.find({
                PaymentStatus: "Paid",
                orderdate: { $gte: startDate, $lte: currentDate },
            }).populate("products.productid");
            console.log(orders);
            if(orders.length==0){
                if(interval) res.json({errorMessage:`There is no order for this ${interval}.`})
                else res.json({errorMessage:"There is no order in this days"})
            }
            else{
                let totalSales = 0;
                let totaldiscount = 0;
console.log('one');
orders.forEach((order) => {
    totaldiscount += order.discountAmount || 0;
    totalSales += order.totalAmount || 0;
});

console.log('two');
if(downloadformat=="pdf"){
    
    console.log('three');
    const pdfBuffer = await generateSalesPDF(orders, startDate, currentDate);
    
    // Set headers for the response
    console.log('four');
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=sales Report.pdf"
        );
        
        // const pf = Buffer(pdfBuffer).toString()
        res.status(200).end(pdfBuffer);

                }
                else{
                    pdf.downloadReport(
                        req,
                        res,
                        orders,
                        startDate,
                        currentDate,
                        totalSales.toFixed(2),
                        totaldiscount.toFixed(2),
                        downloadformat
                    );
                }
          
            }
        }
        catch(err){
            console.log(err);
        }
    }
}
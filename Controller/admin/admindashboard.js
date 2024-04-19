const Order = require("../../model/order")
const User = require("../../model/usermodel")
const Category =  require("../../model/category")
const { generateSalesPDF } = require("../../util/generatesalespdfcreator");
const pdf =  require("../../util/generatesalesreportcreator")
const moment  =  require("moment");
const { format } = require("date-fns");

module.exports = {
    getdashboard:async(req,res)=>{
        try{
            const errorMessage = req.session.errorMessage
            delete req.session.errorMessage
            const [sales, revenue, customers, recentOrders, topSelling,topsellingCat] = await Promise.all([
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
                    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' } },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 5 },
                    { $project: { _id: 1, totalQuantity: 1, productInfo: { $arrayElemAt: ['$productInfo', 0] } } }
                ]),
                Order.aggregate([
                    { $unwind: "$products" },
          
                    {
                      $lookup: {from: "products",localField: "products.productid",foreignField: "_id",as: "productDetail",},
                    },
                    { $unwind: "$productDetail" },
          
                    {
                      $project: {_id: "$productDetail.Category",TotalQuantity: "$products.quantity",productName: "$productDetail.productName",Price: "$productDetail.grandprice",Description: "$productDetail.Description",},
                    },
          
                    {
                      $group: {_id: "$_id",TotalQuantity: { $sum: "$TotalQuantity" },},
                    },
          
                    { $sort: { TotalQuantity: -1 } },
          
                    { $limit: 3 },
                  ]),

            ])
            let quant ;
            const result = await Promise.all(
                topsellingCat.map(async (item) => {
                  try {
                    const category = await Category.findById(item._id);
                    quant += item.TotalQuantity;
                    return {
                      categoryName: category.categoryname,
                      totalQuantity: item.TotalQuantity,
                    };
                  } catch (error) {
                    console.error("Error finding category:", error);
                    return null;
                  }
                })
              );
            console.log(topsellingCat);

            const totalSales = sales[0] ? sales[0].totalSalesCount : 0;
            const totalRevenue = revenue[0] ? revenue[0].totalDiscountAmount : 0;

            res.render('admin/dashboard', { totalSales, totalRevenue, customers, recentOrders, topSelling,result,quant ,errorMessage})

        }
        catch(err){
            console.log(err);
        }
    },
    getchart : async(req,res) => {
        try{
            console.log(req.url);
            const orders = await Order.find(
                { orderStatus: { $nin: ["Order Rejected", "Cancelled"] } }
            )

            const orderCountsByDay = {};
            const totalAmountByDay = {};
            const orderCountsByMonthYear = {};
            const totalAmountByMonthYear = {};
            const orderCountsByYear = {};
            const totalAmountByYear = {};
            let labelsByCount;
            let labelsByAmount;


            orders.forEach((order) => {

                const orderDate = moment(order.orderdate, "ddd MMM DD YYYY");
                const dayMonthYear = orderDate.format("YYYY-MM-DD");
                const monthYear = orderDate.format("YYYY-MM");
                const year = orderDate.format("YYYY");

                if (req.url === "/count-orders-by-day") {
                    if (!orderCountsByDay[dayMonthYear]) {
                        orderCountsByDay[dayMonthYear] = 1;
                        totalAmountByDay[dayMonthYear] = order.totalAmount;
                    } else {
                        orderCountsByDay[dayMonthYear]++;
                        totalAmountByDay[dayMonthYear] += order.totalAmount;
                    }

                    const ordersByDay = Object.keys(orderCountsByDay).map(
                        (dayMonthYear) => ({
                            _id: dayMonthYear,
                            count: orderCountsByDay[dayMonthYear],
                        })
                    );

                    const amountsByDay = Object.keys(totalAmountByDay).map(
                        (dayMonthYear) => ({
                            _id: dayMonthYear,
                            total: totalAmountByDay[dayMonthYear],
                        })
                    );

                    amountsByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
                    ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));

                    labelsByCount = ordersByDay.map((entry) =>
                        moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
                    );

                    labelsByAmount = amountsByDay.map((entry) =>
                        moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
                    );

                    dataByCount = ordersByDay.map((entry) => entry.count);
                    dataByAmount = amountsByDay.map((entry) => entry.total);

                }else if (req.url === "/count-orders-by-month") {
                    console.log(1);
                    if (!orderCountsByMonthYear[monthYear]) {
                      orderCountsByMonthYear[monthYear] = 1;
                      totalAmountByMonthYear[monthYear] = order.totalAmount;
                    } else {
                      orderCountsByMonthYear[monthYear]++;
                      totalAmountByMonthYear[monthYear] += order.totalAmount;
                    }
          
                    const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
                      (monthYear) => ({
                        _id: monthYear,
                        count: orderCountsByMonthYear[monthYear],
                      })
                    );
                    const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
                      (monthYear) => ({
                        _id: monthYear,
                        total: totalAmountByMonthYear[monthYear],
                      })
                    );
          
                    ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
                    amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          
                    labelsByCount = ordersByMonth.map((entry) =>
                      moment(entry._id, "YYYY-MM").format("MMM YYYY")
                    );
                    labelsByAmount = amountsByMonth.map((entry) =>
                      moment(entry._id, "YYYY-MM").format("MMM YYYY")
                    );
                    dataByCount = ordersByMonth.map((entry) => entry.count);
                    dataByAmount = amountsByMonth.map((entry) => entry.total);
                  
                } else if (req.url === "/count-orders-by-year") {
                    if (!orderCountsByYear[year]) {
                        orderCountsByYear[year] = 1;
                        totalAmountByYear[year] = order.totalAmount;
                    } else {
                        orderCountsByYear[year]++;
                        totalAmountByYear[year] += order.totalAmount;
                    }

                    const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
                        _id: year,
                        count: orderCountsByYear[year],
                    }));
                    const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
                        _id: year,
                        total: totalAmountByYear[year],
                    }));

                    ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
                    amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));

                    labelsByCount = ordersByYear.map((entry) => entry._id);
                    labelsByAmount = amountsByYear.map((entry) => entry._id);
                    dataByCount = ordersByYear.map((entry) => entry.count);
                    dataByAmount = amountsByYear.map((entry) => entry.total);
                }
            })

            res.json({ labelsByCount, labelsByAmount, dataByCount, dataByAmount });

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
                currentDate = new Date(endDate);
                startDate =  new Date(startDate)
                console.log(currentDate);
            } else {
                console.log("jghdgfdsf");
                currentDate = new Date();
                startDate = new Date(currentDate);
                console.log(startDate);
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
            }).populate("products.productid").populate("userid");
            console.log(orders);
            if(orders.length==0){
                if(interval) req.session.errorMessage = `There is no order for this ${interval}.`;
                else req.session.errorMessage = "There is no order in this days";
                res.redirect("/admin")
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
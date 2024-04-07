const ejs = require('ejs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const exceljs = require('exceljs');
const dateFormat = require('date-fns/format');
const { format } = require("date-fns");


module.exports = {
    downloadReport: async (req, res, orders, startDate, currentDate, totalSales, totaldiscount, downloadformat) => {
        
      const formattedStartDate = format(new Date(startDate), 'yyyy-MM-dd');
      const formattedEndDate = format(new Date(currentDate), 'yyyy-MM-dd');
      try {
        const totalAmount = parseInt(totalSales)
        console.log('Total Sales:', totalAmount);
        const template = fs.readFileSync('util/template.ejs', 'utf-8');
        const html = ejs.render(template, { orders, startDate, currentDate, totalAmount ,totaldiscount});
        

        if (downloadformat === 'excell') {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Sales Report');
  
          worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 25 },
            { header: 'Product Name', key: 'productName', width: 25 },
            { header: 'User ID', key: 'userId', width: 25},
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Total Amount', key: 'totalamount', width: 25 },
            { header: 'Payment Method', key: 'paymentmethod', width: 25 },
          ];
  
          let totalSalesAmount = 0;
          let totaldiscountAmount = 0;
  
          orders.forEach(order => {
         
            order.products.forEach(item => {
            
              worksheet.addRow({
                orderId: order._id,
                productName: item?.productid?.productName,
                userId: order.userid,
                date: order.orderdate ? new Date(order.orderDate).toLocaleDateString() : '',
                totalamount: order.totalAmount !== undefined ? order.totalAmount.toFixed(2) : '',
                paymentmethod: order.paymentMethod,
              });

              
              totalSalesAmount += order.totalAmount !== undefined ? order.totalAmount : 0;
              totaldiscountAmount += order.discountAmount !== undefined ? order.discountAmount : 0;
              
            });
          });
  
          
          worksheet.addRow({ totalamount: 'Total Sales Amount', paymentmethod: totalSalesAmount.toFixed(2) });
          worksheet.addRow({ totalamount: 'Total discount Amount', paymentmethod: totaldiscountAmount.toFixed(2) });
          worksheet.addRow({ totalamount: 'Total discount', paymentmethod: orders.length });
          console.log("hlo");
          const excelFilePath = `public/SRexcel/sales-report-${formattedStartDate}-${formattedEndDate}.xlsx`;
          console.log(excelFilePath);
          await workbook.xlsx.writeFile(excelFilePath);

          res.status(200).download(excelFilePath);
        } else {
          res.status(400).send('Invalid download format');
        }
      } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
      }
    },
};
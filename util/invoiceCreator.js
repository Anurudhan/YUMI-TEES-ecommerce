const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');

module.exports = {
    generateInvoice: async (orderDetail, index, Deliverproduct) => {
      try {
        const formatDate = (date) => {
          return date ? new Date(date).toLocaleDateString("en-US") : " ";
        };
  
        const data = {
          customize: {},
          images: {
            logo: fs.readFileSync(
              path.join(__dirname, "..", "public", "assets", "logoblack.png"),
              "base64"
            ),
          },
          sender: {
            company: "Yumi-Tees",
            address: "silk street,Kozhikode,Kerala, India",
            zip: "673012",
            city: "Calicut",
            state:"Kerala",
            country: "india",
          },
          client: {
            company: orderDetail.address.locality,
            address: orderDetail.address.address,
            zip: orderDetail.address.pincode,
            city: orderDetail.address.city,
            country: "India",
          },
          information: {
            orderId : orderDetail.orderid,
  
            date: formatDate(orderDetail.orderdate),
  
            dueDate: formatDate(orderDetail.orderdate),
          },
          products: Deliverproduct.map((product) => ({
            quantity: product.quantity.toString(),
            description: product.productid.productName,
            price: product.productid.grandprice,
          })),
          bottomNotice: "Thank you for choosing Yumi-Tees",
          settings: {
            "  currency": "INR",
            "tax-notation": "GST",
            "margin-top": 25,
            "margin-right": 25,
            "margin-left": 25,
            "margin-bottom": 25,
          },
        };
        console.log("invoice data", data);
  
        const result = await easyinvoice.createInvoice(data);
  
        if (result.pdf) {
          const pdfpath = path.join(
            __dirname,
            "..",
            "public",
            "Invoice",
            `${orderDetail._id}.pdf`
          );
          await fs.promises.writeFile(pdfpath, result.pdf, "base64");
          console.log("Successfull", pdfpath);
          return pdfpath;
        } else {
          console.log("Erroo in invoice pdf ",result);
          return null;
        }
      } catch (err) {
        console.log(err);
        return null
      }
    },
  };
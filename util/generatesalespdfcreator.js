const PDFDocument = require("pdfkit");
const moment = require("moment");

// Table Row with Bottom Line
function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6, c7) {
    doc
        .fontSize(7)
        .text(c1, 40, y)
        .text(c2, 70, y)
        .text(c3, 180, y)
        .text(c4, 300, y)
        .text(c5, 400, y)
        .text(c6, 470, y)
        .text(c7, 0, y, { align: "right" })
        .moveTo(50, y + 15)
        .lineTo(560, y + 15)
        .lineWidth(0.5)
        .strokeColor("#ccc")
        .stroke();
}

// Table row without bottom line
function generateTableRowNoLine(doc, y, c1, c2, c3, c4, c5) {
    doc
        .fontSize(7)
        .text(c1, 100, y)
        .text(c2, 100, y)
        .text(c3, 420, y, { width: 90, align: "right" })
        .text(c4, 200, y, { width: 90, align: "right" })
        .text(c5, 0, y, { align: "right" });
}

// Generating Invoice for customers
const generateSalesPDF = async (orders, startDate, currentDate) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            const buffers = [];
            doc.on("data", (buffer) => buffers.push(buffer));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (error) => reject(error));

            // Products
            // Footer for the PDF
            doc
                .fontSize(15)
                .text(
                    `Sales Report ${startDate.toLocaleDateString() +
                    " " +
                    startDate.toLocaleTimeString()
                    } to ${currentDate.toLocaleDateString() + " " + currentDate.toLocaleTimeString()
                    }`,
                    50,
                    50,
                    {
                        align: "center",
                        width: 500,
                        color: "white",
                        backgroundColor: "gray",
                    }
                );

            const invoiceTableTop = 100;

            // Table Header
            generateTableRow(
                doc,
                invoiceTableTop,
                "SL No",
                "product Name",
                "User Name",
                "Order Date",
                "Payment Method",
                "coupon Amount",
                "Amount"
            );

            let i = 0;
            let sum = 0;
            let discount = 0;
            orders.forEach((x) => {
                x.products.forEach((item)=>{
                var position = invoiceTableTop + (i + 1) * 30;
                sum += x.totalAmount;
                discount += x.discountAmount
                generateTableRow(
                    doc,
                    position,
                    i + 1,
                    item?.productid?.productName,
                    x.userid?.name,
                    x.orderdate.toLocaleDateString() + x.orderdate.toLocaleTimeString(),
                    x.paymentMethod,
                    x.couponDiscount,
                    x.totalAmount || x.discountAmount
                );
                i++;
            })
            });

            // Summary rows
            const subtotalPosition = invoiceTableTop + orders.length * 30;

            const paidToDatePosition = subtotalPosition + 30;

            const duePosition = paidToDatePosition + 20;
            const forPosition = paidToDatePosition + 35;
            const endposition = paidToDatePosition + 50
            generateTableRowNoLine(doc, duePosition, "", "", "Total Sales Amount", "", sum);
            generateTableRowNoLine(doc, forPosition, "", "", "Total Discount Amount", "", discount);
            generateTableRowNoLine(doc, endposition, "", "", "Total Orders", "", orders.length);

            // End the document
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateSalesPDF,
}
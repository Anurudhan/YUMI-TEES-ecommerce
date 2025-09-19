const Cart = require("../model/cartmodel");
const Product = require("../model/productSchema");
const AppError = require("./AppError");


async function validateCartProducts(userId) {
    const cart = await Cart.findOne({ userid: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    if (!cart.products || !cart.products.length) {
        throw new AppError("Cart is empty", 400);
    }

    let totalAmount = 0;
    let productDiscount = 0;
    let productsForOrder = [];

    for (const item of cart.products) {
        const prdt = await Product.findById(item.productid);
        if (!prdt) throw new AppError("Product not found, please contact our team", 404);

        if (prdt.stockQuantity < item.quantity) {
            const msg =
                prdt.stockQuantity === 0
                    ? `Product "${prdt.name}" is completely out of stock.`
                    : `Product "${prdt.name}" has only ${prdt.stockQuantity} left in stock.`;
            throw new AppError(msg, 409);
        }

        const price = prdt.price;
        const discountAmount = prdt.discountAmount || 0;

        productsForOrder.push({
            productId: prdt._id,
            quantity: item.quantity,
            status: "Pending"
        });

        totalAmount += item.quantity * price;
        productDiscount += item.quantity * discountAmount;
    }

    return { productsForOrder, totalAmount, productDiscount };
}

module.exports = { validateCartProducts };

const mongoose = require("mongoose");
const Product = require("../../model/productSchema");
const Category = require("../../model/category");
const Cart = require("../../model/cartmodel");
const MESSAGES = require("../../util/messages");

module.exports = {
    getProducts: async (req, res) => {
        try {
            // Log session data for debugging
            console.log('Session data:', {
                username: req.session.username,
                cart: req.session.cart,
                wish: req.session.wish
            });

            // Extract and sanitize query parameters
            const { search, Category: categoryParam, min, max, page = 1 } = req.query;
            const pageSize = 8;
            const currentPage = Math.max(1, parseInt(page) || 1);
            const searchTerm = search ? search.trim() : '';
            const minPrice = min && !isNaN(parseFloat(min)) ? Math.max(0, parseFloat(min)) : 0;
            const maxPrice = max && !isNaN(parseFloat(max)) ? Math.min(10000, parseFloat(max)) : 10000;

            // Log query parameters for debugging
            console.log('Query parameters:', { searchTerm, categoryParam, minPrice, maxPrice, currentPage });

            // Verify Category model
            if (!Category || typeof Category.find !== 'function') {
                throw new Error('Category model is not properly defined');
            }

            // Build query
            let query = { displayStatus: "Show" };
            let flag = 0;

            // Handle search
            if (searchTerm) {
                flag = 1;
                const searchRegex = new RegExp(searchTerm, 'i');
                const categories = await Category.find({ 
                    categoryname: searchRegex,
                    Status: "Show"
                }).select('_id').lean();
                query.$or = [
                    { productName: searchRegex },
                    { Description: searchRegex },
                    { tags: searchRegex },
                    { Category: { $in: categories.map(cat => cat._id) } }
                ];
            }

            // Handle category filter
            if (categoryParam) {
                flag = 1;
                const validCategories = await Category.find({ 
                    _id: { $in: Array.isArray(categoryParam) ? categoryParam : [categoryParam] },
                    Status: "Show"
                }).select('_id').lean();
                if (validCategories.length > 0) {
                    query.Category = { $in: validCategories.map(cat => cat._id) };
                }
            }

            // Handle price filter
            if (minPrice > 0 || maxPrice < 10000) {
                flag = 1;
                query.grandprice = { $gte: minPrice, $lte: maxPrice };
            }

            // Log query for debugging
            console.log('MongoDB query:', query);

            // Fetch products
            const products = await Product.find(query)
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * pageSize)
                .limit(pageSize)
                .populate({ path: 'Category', select: 'categoryname' })
                .lean();

            // Get total count and categories
            const [count, categories] = await Promise.all([
                Product.countDocuments(query),
                Category.find({ Status: "Show" })
                    .select('_id categoryname')
                    .lean()
                    .then(cats => Promise.all(cats.map(async cat => {
                        const count = await Product.countDocuments({ 
                            Category: cat._id, 
                            displayStatus: "Show" 
                        });
                        return { 
                            _id: { categoryId: cat._id, categoryName: cat.categoryname, Status: "Show" }, 
                            count 
                        };
                    })))
            ]);

            // Build query string for pagination
            const queryParams = { 
                search: searchTerm || undefined, 
                Category: categoryParam || undefined, 
                min: minPrice > 0 ? minPrice : undefined, 
                max: maxPrice < 10000 ? maxPrice : undefined 
            };
            const existingQueryString = Object.entries(queryParams)
                .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
                .map(([key, value]) => 
                    Array.isArray(value) 
                        ? value.map(v => `${key}=${encodeURIComponent(v)}`).join('&')
                        : `${key}=${encodeURIComponent(value)}`
                )
                .join('&');

            // Render template
            res.render("user/allproduct", {
                product: products,
                categories,
                count,
                totalpages: Math.ceil(count / pageSize),
                currentPage,
                wish: req.session.wish || 0,
                username: req.session.username || '',
                cart: req.session.cart || 0,
                flag,
                existingQueryString: existingQueryString ? `&${existingQueryString}` : '',
                searchTerm: searchTerm,
                selectedCategories: Array.isArray(categoryParam) ? categoryParam : categoryParam ? [categoryParam] : [],
                min: minPrice,
                max: maxPrice
            });
        } catch (err) {
            console.error('Error in getProducts:', {
                message: err.message,
                stack: err.stack,
                query: req.query,
                session: {
                    username: req.session.username,
                    cart: req.session.cart,
                    wish: req.session.wish
                }
            });
            // Temporary redirect until error.ejs is created
            res.redirect('/allproduct?error=Unable+to+load+products');
        }
    },

    uniqueproduct: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.isValidObjectId(id)) {
                throw new Error(MESSAGES.PRODUCT.ERROR.NOT_FOUND);
            }
            const product = await Product.findOne({ _id: id })
                .populate({ path: 'Category', select: 'categoryname' })
                .lean();
            if (!product) {
                throw new Error(MESSAGES.PRODUCT.ERROR.NOT_FOUND);
            }
            const checkcart = await Cart.findOne({ "products.productid": id }).lean();
            res.render("user/uniqueproduct", { 
                product,
                username: req.session.username || '',
                cart: req.session.cart || 0,
                wish: req.session.wish || 0,
                checkcart
            });
        } catch (err) {
            console.error('Error in uniqueproduct:', {
                message: err.message,
                stack: err.stack,
                params: req.params
            });
            res.redirect('/allproduct?error=Product+not+found');
        }
    }
};

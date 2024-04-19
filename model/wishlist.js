const mongoose = require('mongoose');
const Schema =mongoose.Schema;

const WishlistSchema= new Schema({
    userid: {
        type: Schema.Types.ObjectId,
      },
       products: [{
        productid: {
          type: Schema.Types.ObjectId,ref : 'product'
        },
      }],
})

const Wishlist = mongoose.model("WishList", WishlistSchema);
module.exports = Wishlist;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartSchema = new Schema({
    userid:{
        type:Schema.Types.ObjectId
    },
    products:[
        {
            productid:{
                type:Schema.Types.ObjectId,ref: "product"
            },
            quantity:{
                type:Number
            }
        }
    ]
})
module.exports = mongoose.model('cart',cartSchema);
const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const retutnItemSchema = new Schema({
    userid: { type: mongoose.Schema.Types.ObjectId },
    orderid: { type: mongoose.Schema.Types.ObjectId },
    productid: { type: mongoose.Schema.Types.ObjectId },
    returnReason: {
      type: String,
    },
    description: {
      type: String,
    },
    status : {
      type : String,
      default: "Requested"
    }
  });

const returndetails = mongoose.model("returndetails", retutnItemSchema);
module.exports = returndetails;
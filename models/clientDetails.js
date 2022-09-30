const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientDetailsSchema = new Schema({
    category: {
        type: Array
    }
})

const ClientDetails = mongoose.model("clientdetails", ClientDetailsSchema);
module.exports = ClientDetails;














const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientDetailsSchema = new Schema({
    category: {
        type: Array
    },
    brand_id: {
        type: Schema.Types.ObjectId
    }
})

const ClientDetails = mongoose.model("clientdetails", ClientDetailsSchema);
module.exports = ClientDetails;














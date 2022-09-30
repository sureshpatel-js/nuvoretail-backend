const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientSellerDetailSchema = new Schema({
    created_by: {
        type: Schema.Types.ObjectId
    },
    seller_name: {
        type: String
    },
    selected: {
        type: Boolean,
        default: false
    },
    seller_type: {
        type: String
    }

});


const ClientSellerDetail = mongoose.model('clientsellerdetail', ClientSellerDetailSchema);
module.exports = ClientSellerDetail;

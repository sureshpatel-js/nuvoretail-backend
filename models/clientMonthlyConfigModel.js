const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientMonthlyConfigSchema = new Schema({
    created_by: {
        type: Schema.Types.ObjectId
    },
    product_list: {
        type: Array
    },
    authorized_seller_list: {
        type: Array
    },
    keyword_budget: {
        type: Object
    },
    prioritize_competitor: {
        type: Array
    },
    created_by: {
        type: Schema.Types.ObjectId
    },
    created_at: {
        type: Date
    },
    created_for_month: {
        type: String
    },
    udpdated_at: {
        type: Date
    },
    category_wise_sales_and_spend_target: {
        type: Array
    },
    updated_by: {
        type: Schema.Types.ObjectId
    },
    brand_id: {
        type: Schema.Types.ObjectId
    },
});


const ClientMonthlyConfig = mongoose.model('clientMonthlyConfig', ClientMonthlyConfigSchema);
module.exports = ClientMonthlyConfig;


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientMonthlyConfigSchema = new Schema({
    user_id: {
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
    stage_one_created_date: {
        type: Date
    },
    stage_two_created_date: {
        type: Date
    },
    udpdated_at: {
        type: Date
    }

});


const ClientMonthlyConfig = mongoose.model('clientMonthlyConfig', ClientMonthlyConfigSchema);
module.exports = ClientMonthlyConfig;

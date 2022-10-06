const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PowerBiConfigSchema = new Schema({
    group_id: {
        type: String
    },
    report_id: {
        type: String
    },
    brand_name: {
        type: String
    },
    created_by: {
        type: Schema.Types.ObjectId
    },
    dashboard_category: {
        type: String
    },
    brand_id: {
        type: Schema.Types.ObjectId
    },
    dashboard_name: {
        type: String
    },
    created_at: {
        type: Date
    },
    udpdated_at: {
        type: Date
    },
    updated_by: {
        type: Schema.Types.ObjectId
    },
})

const PowerBiConfig = mongoose.model("powerBiConfig", PowerBiConfigSchema);
module.exports = PowerBiConfig;
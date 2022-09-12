const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampaignReportSchema = new Schema({
    cost: {
        type: Number
    },
    campaign_id: {
        type: String
    },
    impressions: {
        type: Number
    },
    campaign_budget: {
        type: Number
    },
    attributed_conversions_14_d: {
        type: Number
    },
    attributed_units_ordered_14_d_same_sku: {
        type: Number
    },
    campaign_status: {
        type: String
    },
    clicks: {
        type: Number
    },
    attributed_sales_14_d: {
        type: Number
    },
    campaign_name: {
        type: String
    },
    attributed_units_ordered_14_d: {
        type: Number
    },
    time_stamp: {
        type: Date
    },
    campaign_type: {
        type: String
    },
    client_profile_id: {
        type: String
    }
})

const CampaignReport = mongoose.model("campaignReport", CampaignReportSchema);
module.exports = CampaignReport;
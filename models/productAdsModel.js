const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductAdsSchema = new Schema({
    cost: {
        type: Number
    },
    ad_group_name: {
        type: String
    },
    campaign_id: {
        type: String
    },
    impressions: {
        type: Number
    },
    ad_group_id: {
        type: String
    },
    ad_id: {
        type: String
    },
    attributed_conversions_14_d: {
        type: String
    },
    attributed_units_ordered_14_d_same_sku: {
        type: String
    },
    clicks: {
        type: Number
    },
    asin: {
        type: String
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
    date: {
        type: Date
    },
    campaign_type: {
        type: String
    },
    client_profile_id: {
        type: String
    }
})

const ProductAds = mongoose.model("productAds", ProductAdsSchema);
module.exports = ProductAds;
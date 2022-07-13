const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BrandHealthSchema = new Schema({
    brand_id: {
        type: Schema.Types.ObjectId
    },
    time_stamp: {
        type: Date
    },
    pname: {
        type: String
    },
    platform_code: {
        type: String
    },
    platform: {
        type: String
    },
    rank: {
        type: Number
    },
    rating: {
        type: Number
    },
    review_type: {
        type: String
    },
    no_of_rating: {
        type: Number
    },
    no_of_review: {
        type: Number
    },
    cust_rating: {
        type: Number
    },
    comment_date: {
        type: String
    },
    comment_title: {
        type: String
    },
    comment: {
        type: String
    },
    verified: {
        type: String
    },
    mosthelpful_votes: {
        type: Number
    }
})

const BrandHealth = mongoose.model("brandHealth", BrandHealthSchema);
module.exports = BrandHealth;


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BrandHealthSchema = new Schema({
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
        type: String
    },
    rating: {
        type: String
    },
    review_type: {
        type: String
    },
    no_of_rating: {
        type: String
    },
    no_of_review: {
        type: String
    },
    cust_rating: {
        type: String
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
        type: String
    }
})

const BrandHealth = mongoose.model("brandHealth",BrandHealthSchema);
module.exports = BrandHealth;


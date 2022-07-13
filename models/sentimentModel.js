const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SentimentSchema = new Schema({
    time_stamp: {
        type: Date
    },
    platform_code: {
        type: String
    },
    platform: {
        type: String
    },
    rating: {
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
    screenshot_url: {
        type: String
    },
    deal: {
        type: String
    },
    sns: {
        type: String
    },
    coupon: {
        type: String
    },
    main_cat: {
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
    ptype: {
        type: String
    },
    sentiment: {
        type: String
    },
    preprocessed_comments: {
        type: String
    },
    cust_name: {
        type: String
    }
})

// UserSchema.pre("save", function (next) {
//     this.company_id = this._id;
//     next();
// })

const Sentiment = mongoose.model("sentiment", SentimentSchema);
module.exports = Sentiment;

















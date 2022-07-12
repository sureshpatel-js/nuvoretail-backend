const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OsaSchema = new Schema({
    time_stamp: {
        type: Date
    },
    platform_code: {
        type: String
    },
    platform: {
        type: String
    },
    sp: {
        type: String
    },
    rating: {
        type: String
    },
    status_text: {
        type: String
    },
    seller: {
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
    main_cat_rank: {
        type: String
    },
    sub_cat: {
        type: String
    },
    sub_cat_rank: {
        type: String
    },
    defaultasin: {
        type: String
    },
    expiry_date: {
        type: String
    },
    delivery_days: {
        type: String
    },
    location: {
        type: String
    },
    prod_url: {
        type: String
    }
})

// UserSchema.pre("save", function (next) {
//     this.company_id = this._id;
//     next();
// })

const Osa = mongoose.model("osa", OsaSchema);
module.exports = Osa;







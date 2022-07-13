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
        type: Number
    },
    rating: {
        type: Number
    },
    status: {
        type: Boolean
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
        type: Number
    },
    sub_cat: {
        type: String
    },
    sub_cat_rank: {
        type: Number
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
    },
    created_at: {
        type: Date,
        default: Date.now(),
    }
})

// UserSchema.pre("save", function (next) {
//     this.company_id = this._id;
//     next();
// })

const Osa = mongoose.model("osa", OsaSchema);
module.exports = Osa;







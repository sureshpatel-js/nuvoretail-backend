const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BrandSchema = new Schema({
    brand_name: {
        type: String
    },
    company_id: {
        type: Schema.Types.ObjectId
    },
    created_by: {
        type: Schema.Types.ObjectId
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
})

const Brand = mongoose.model("brand", BrandSchema);
module.exports = Brand;














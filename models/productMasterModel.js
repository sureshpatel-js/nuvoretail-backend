const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productMasterSchema = new Schema({
    brand: {
        type: String
    },
    category: {
        type: String
    },
    platform: {
        type: String
    },
    asin: {
        type: String
    },
    ean: {
        type: String
    },
    title: {
        type: String
    },
    mrp: {
        type: Number
    },
    product: {
        type: String
    },
    quantity_or_pack_size: {
        type: String
    },
    sku: {
        type: String
    },
    sub_category: {
        type: String
    },
    url: {
        type: String
    },
    priority: {
        type: String
    }

})


const ProductMaster = mongoose.model("productMaster", productMasterSchema);
module.exports = ProductMaster;

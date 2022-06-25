
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BrandCompititionMappingSchema = new Schema({
    brand_name: {
        type: String
    },
    strong_compitition: {
        type: String
    }
});

const BrandCompititionMapping = mongoose.model('brandCompititionMapping', BrandCompititionMappingSchema);
module.exports = BrandCompititionMapping;

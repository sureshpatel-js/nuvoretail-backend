const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OnbordingCrolledDataSchema = new Schema({
    brand_id: {
        type: Schema.Types.ObjectId
    },
    platform_code: {
        type: String
    },
    platform: {
        type: String
    },
    product_name: {
        type: String
    },
    sp: {
        type: String
    },
    pack_size: {
        type: String
    },
    mrp: {
        type: String
    },
    seller: {
        type: String
    },
    main_cat: {
        type: String
    },
    sub_cat: {
        type: String
    },
    created_at: {
        type: Date
    }
});


const OnbordingCrolledData = mongoose.model('onbordingCrolledData', OnbordingCrolledDataSchema);
module.exports = OnbordingCrolledData;
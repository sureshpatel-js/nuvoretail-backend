const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OnbordingCrolledDataSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId
    },
    platform_code: {
        type: String
    },
    product_code: {
        type: String
    },
    brand_name: {
        type: String
    },
    pname: {
        type: String
    },
    sp: {
        type: Number
    },
    pack_size: {
        type: String
    },
    mrp: {
        type: Number
    },
    seller: {
        type: String
    },
    main_cat: {
        type: String
    },
    sub_cat: {
        tye: String
    },
    created_at: {
        type: Date
    }
});


const OnbordingCrolledData = mongoose.model('onbordingCrolledData', OnbordingCrolledDataSchema);
module.exports = OnbordingCrolledData;
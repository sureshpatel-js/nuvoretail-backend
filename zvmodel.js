const mongoose = require("mongoose");

const visibilitySchema = mongoose.Schema({

    date_stamp:  {
        type: Date
    },
    time_stamp: {
        type: Number
    },
    keyword: {
        type: String
    },
    rank:{
        type: Number
    },
    prod_name:{
        type: String
    },
    placement: {
        type: String
    },
    placement_group:{
        type: String
    },
    prod_url:{
        type: String
    },
    brand_comp:{
        type: String
    },
    prod_code: {
        type: String
    }

})

const Visibility = mongoose.model('Visibility', visibilitySchema);
module.exports = Visibility;
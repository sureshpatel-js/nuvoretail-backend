const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OnbordingCrawledDataSchema = new Schema({
    brand_id: {
        type: Schema.Types.ObjectId
    },
    time_stamp: {
        type: Date
    },
    platform_code: {
        type: String
    },
    platform: {
        type: String
    },
    location: {
        type: String
    },
    item_unit: {
        type: String
    },
    item_weight: {
        type: Number
    },
    item_package_weight_unit: {
        type: String
    },
    item_package_weight: {
        type: Number
    },
    mrp: {
        type: Number
    },
    sp: {
        type: Number
    },
    brand_name: {
        type: String
    },
    pname: {
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
    net_quantity_unit: {
        type: String
    },
    net_quantity: {
        type: Number
    },
    browse_node: {
        type: Number
    },
    packer_contact_information: {
        type: String
    },
    item_type_name: {
        type: String
    },
    ean: {
        type: Number
    },
    image_links: {
        type: String
    },
    color_name: {
        type: String
    },
    manufacturer: {
        type: String
    },
    variation_type: {
        type: String
    },
    backend_keywords: {
        type: String
    },
    status_text: {
        type: String
    },
    flavour: {
        type: String
    },
    seller: {
        type: String
    },
    rating: {
        type: Number
    },
    no_of_ratings: {
        type: Number
    },
    no_of_reviews: {
        type: Number
    },
    image_count: {
        type: Number
    },
    bullet_points: {
        type: String
    },
    number_of_bullet_points: {
        type: Number
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
    parent_child_relation: {
        type: String
    },
    delivery_date: {
        type: String
    },
    delivery_days: {
        type: String
    },
    aplus: {
        type: String
    },
    video_count: {
        type: Number
    },
    linked_to_webstore: {
        type: String
    },
    default_asin: {
        type: String
    },
    prod_url: {
        type: String
    }
});


const OnbordingCrawledData = mongoose.model('onbordingCrawledData', OnbordingCrawledDataSchema);
module.exports = OnbordingCrawledData;
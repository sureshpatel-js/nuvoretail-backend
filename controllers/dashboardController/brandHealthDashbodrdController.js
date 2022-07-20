const BrandHealthModel = require("../../models/brandHealthModel");
const ProductMasterModel = require("../../models/productMasterModel");
const ProductAdsModel = require("../../models/productAdsModel");
const OsaModel = require("../../models/osaModel");
const AppError = require("../../utils/errorHandling/AppError");
const { validateBrandHealthDashboardBody } = require("../../validate/validateDashboard/validateBrandHealthDashboard");



exports.getBrandHealthDashboardData = async (req, res, next) => {
    const value = await validateBrandHealthDashboardBody(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    const { start_date, end_date } = req.body;
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    try {
        const osaArray = await OsaModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: startDate, $lte: endDate }
                }
            }
            ,
            {
                $group: {
                    _id: {
                        time_stamp: "$time_stamp",
                        platform_code: "$platform_code"
                    },
                    available_location_no: { $sum: { $cond: { if: { $eq: ["$status", true] }, then: 1, else: 0 } } },
                    total_location_no: { $sum: 1 }
                }
            },
            {//total_location_no is zero then
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_location_no"] }, 100] }, }, },
                }
            },
            {
                $unset: ["available_location_no", "total_location_no"]
            },
            {
                $group: {
                    _id: "$_id.time_stamp",
                    "status": {
                        $push: {
                            platform_code: "$_id.platform_code",
                            available: "$available",
                        }
                    }
                },
            },
            {
                $sort: { "_id": 1 }
            },
        ])
        const todaysOsaData = await OsaModel.aggregate([
            {
                $match: {
                    time_stamp: new Date("2022-07-10T00:00:00.000+00:00")
                }
            },
            {
                $group: {
                    _id: "$platform_code",
                    deals_at_location: { $sum: { $cond: { if: { $ne: ["$deal", null] }, then: 1, else: 0 } } },
                }
            }

        ])
        const brandHealthArray = await BrandHealthModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: new Date("2022-07-10T00:00:00.000+00:00"), $lte: new Date("2022-07-15T00:00:00.000+00:00") }
                }
            }
            ,
            {
                $group: {
                    _id: {
                        time_stamp: "$time_stamp",
                        platform_code: "$platform_code"
                    },
                    out_of_three_top_reviews_positive: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ["$review_type", "Top Reviews"] },
                                        {
                                            $or: [
                                                { $eq: ["$rank", 1] },
                                                { $eq: ["$rank", 2] },
                                                { $eq: ["$rank", 3] }
                                            ]
                                        },
                                        { $gte: ["$cust_rating", 4] }
                                    ]
                                }, then: 1, else: 0
                                //
                                // else: {
                                //     if: {
                                //         $and: [
                                //             { $eq: ["$review_type", "Top Reviews"] },
                                //             {
                                //                 $or: [
                                //                     { $eq: ["$rank", 1] },
                                //                     { $eq: ["$rank", 2] },
                                //                     { $eq: ["$rank", 3] }
                                //                 ]
                                //             },
                                //             { $lte: ["$cust_rating", 2] }
                                //         ]
                                //     }, then: -1, else: 0
                                // }
                                //

                            }
                        }
                    },
                    out_of_three_top_reviews_negative: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ["$review_type", "Top Reviews"] },
                                        {
                                            $or: [
                                                { $eq: ["$rank", 1] },
                                                { $eq: ["$rank", 2] },
                                                { $eq: ["$rank", 3] }
                                            ]
                                        },
                                        { $lte: ["$cust_rating", 2] }
                                    ]
                                }, then: 1, else: 0
                            }
                        }
                    },

                    out_of_three_most_recent_positive: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ["$review_type", "Most Recent"] },
                                        {
                                            $or: [
                                                { "$eq": ["$rank", 1] },
                                                { "$eq": ["$rank", 2] },
                                                { "$eq": ["$rank", 3] }
                                            ]
                                        },
                                        { $gte: ["$cust_rating", 4] }
                                    ]
                                }, then: 1, else: 0
                                //
                                // else: {
                                //     if: {
                                //         $and: [
                                //             { $eq: ["$review_type", "Most Recent"] },
                                //             {
                                //                 $or: [
                                //                     { "$eq": ["$rank", 1] },
                                //                     { "$eq": ["$rank", 2] },
                                //                     { "$eq": ["$rank", 3] }
                                //                 ]
                                //             },
                                //             { $lte: ["$cust_rating", 2] }
                                //         ]
                                //     }, then: -1, else: 0
                                // }
                                //
                            }
                        }
                    },
                    out_of_three_most_recent_negative: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ["$review_type", "Most Recent"] },
                                        {
                                            $or: [
                                                { "$eq": ["$rank", 1] },
                                                { "$eq": ["$rank", 2] },
                                                { "$eq": ["$rank", 3] }
                                            ]
                                        },
                                        { $lte: ["$cust_rating", 2] }
                                    ]
                                }, then: 1, else: 0
                            }
                        }
                    },
                    rating: { $avg: "$rating" },
                    no_of_rating: { $avg: "$no_of_rating" }
                }
            },
            {
                $group: {
                    _id: "$_id.time_stamp",
                    "status": {
                        $push: {
                            platform_code: "$_id.platform_code",
                            out_of_three_top_reviews_positive: "$out_of_three_top_reviews_positive",
                            out_of_three_top_reviews_negative: "$out_of_three_top_reviews_negative",
                            out_of_three_most_recent_positive: "$out_of_three_most_recent_positive",
                            out_of_three_most_recent_negative: "$out_of_three_most_recent_negative",
                            rating: "$rating",
                            no_of_rating: "$no_of_rating",
                        }
                    }
                },
            }
        ])
        let deals_on_num_of_products = 0
        for (let todaysObj of todaysOsaData) {
            let { deals_at_location } = todaysObj;
            if (deals_at_location > 0) {
                deals_on_num_of_products = deals_on_num_of_products + 1;
            }
        }



        let data = [];

        for (let osaObj of osaArray) {
            const { _id } = osaObj;
            const bhObj = brandHealthArray.filter(bhEl => new Date(bhEl._id).getTime() === new Date(_id).getTime());
            let highly_promotable_products = 0;
            let low_promotable_products;
            let non_promotable_products = 0;
            if (bhObj.length > 0) {

                for (let osaOfProduct of osaObj.status) {
                    const { platform_code } = osaOfProduct;
                    const bhOfProduct = bhObj[0].status.filter(bhEl => bhEl.platform_code === platform_code);

                    if (bhOfProduct.length > 0) {
                        const { available } = osaOfProduct;
                        const {
                            out_of_three_top_reviews_positive,
                            out_of_three_top_reviews_negative,
                            out_of_three_most_recent_positive,
                            out_of_three_most_recent_negative,
                            rating,
                            no_of_rating
                        } = bhOfProduct[0];
                        if (available > 0 && out_of_three_top_reviews_positive === 3 && out_of_three_most_recent_positive === 3 && rating >= 4 && no_of_rating > 10) {
                            highly_promotable_products = highly_promotable_products + 1;
                        }
                        if (available === 0 || out_of_three_top_reviews_negative === 3 || out_of_three_most_recent_negative === 3 || rating < 4 || no_of_rating < 10) {
                            non_promotable_products = non_promotable_products + 1;
                        }
                        low_promotable_products = osaObj.status.length - (highly_promotable_products + non_promotable_products);

                    }
                }
            }
            const obj = {
                time_stamp: _id,
                highly_promotable_products,
                low_promotable_products,
                non_promotable_products,
            }
            data.push(obj);
        }


        const sub_brands = await ProductMasterModel.find();



        res.status(200).json({
            status: "success",
            data: {
                deals_on_num_of_products,
                status_array: data,
                sub_brands
            }
        });


    } catch (error) {
        console.log(error);
    }
}


exports.getOneDayBrandHealthDashboardData = async (req, res, next) => {
    const { time_stamp } = req.body;
    const yesterday = new Date("2022-07-15T00:00:00.000+00:00");
    yesterday.setDate(yesterday.getDate() - 1);
    try {
        //  const osa = await OsaModel.find({time_stamp:"2022-06-24T00:00:00.000+00:00"});
        const osaArray = await OsaModel.aggregate([
            {
                $match: {
                    time_stamp: new Date(time_stamp)
                }
            }
            ,
            {
                $group: {
                    _id: "$platform_code",
                    available_location_no: { $sum: { $cond: { if: { $eq: ["$status", true] }, then: 1, else: 0 } } },
                    total_location_no: { $sum: 1 }
                }
            },
            {
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_location_no"] }, 100] }, }, },
                }
            },
            {
                $unset: ["available_location_no", "total_location_no"]
            }
        ])

        const brandHealthArray = await BrandHealthModel.aggregate([
            {
                $match: {
                    time_stamp: new Date(time_stamp)
                }
            }
            ,
            {
                $group: {
                    _id: "$platform_code",
                    out_of_three_top_reviews_positive: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ["$review_type", "Top Reviews"] },
                                        {
                                            $or: [
                                                { $eq: ["$rank", 1] },
                                                { $eq: ["$rank", 2] },
                                                { $eq: ["$rank", 3] }
                                            ]
                                        },
                                        { $gte: ["$cust_rating", 4] }
                                    ]
                                }, then: 1, else: 0
                            }
                        }
                    },

                    out_of_three_most_recent_positive: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ["$review_type", "Most Recent"] },
                                        {
                                            $or: [
                                                { "$eq": ["$rank", 1] },
                                                { "$eq": ["$rank", 2] },
                                                { "$eq": ["$rank", 3] }
                                            ]
                                        },
                                        { $gte: ["$cust_rating", 4] }
                                    ]
                                }, then: 1, else: 0
                            }
                        }
                    },
                    rating: { $avg: "$rating" },
                    no_of_rating: { $avg: "$no_of_rating" }
                }
            }
        ])
        let highly_promotable_products_status = [];
        let platform_code_array = [];
        for (let osaObj of osaArray) {
            const { _id } = osaObj;
            platform_code_array.push(_id);
            const bhObj = brandHealthArray.filter(bhEl => bhEl._id === _id);
            if (bhObj.length > 0) {
                const { available } = osaObj;
                const {
                    out_of_three_top_reviews_positive,
                    out_of_three_most_recent_positive,
                    rating,
                    no_of_rating
                } = bhObj[0];

                if (available > 0 && out_of_three_top_reviews_positive === 3 && out_of_three_most_recent_positive === 3 && rating >= 4 && no_of_rating > 10) {
                    highly_promotable_products_status.push({
                        platform_code: _id,
                        status: true
                    })
                } else {
                    highly_promotable_products_status.push({
                        platform_code: _id,
                        status: false
                    })
                }
            }
        }
        console.log(platform_code_array)

        const productAdsArray = await ProductAdsModel.aggregate([
            {
                $match: {
                    platform_code: { $in: platform_code_array },

                }
            },
            {
                $group: {
                    _id: "$platform_code",
                    spend: { $sum: "$cost" }
                }
            }
        ]);




        res.status(200).json({
            status: "success",
            productAdsArray
        });


    } catch (error) {
        console.log(error);
    }
}

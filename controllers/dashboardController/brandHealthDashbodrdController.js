const BrandHealthModel = require("../../models/brandHealthModel");
const ProductMasterModel = require("../../models/productMasterModel");
const ProductAdsModel = require("../../models/productAdsModel");
const OsaModel = require("../../models/osaModel");
const AppError = require("../../utils/errorHandling/AppError");
const { validateBrandHealthDashboardBody } = require("../../validate/validateDashboard/validateBrandHealthDashboard");
const { calculateChange } = require("../../utils/commonFunction/dashboardFunction");



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
                    total_doc_no: { $sum: 1 }
                }
            },
            {//total_doc_no is zero then
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_doc_no"] }, 100] }, }, },
                }
            },
            {
                $unset: ["available_location_no", "total_doc_no"]
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
    const yesterday = new Date(time_stamp);
    const dayBeforeYesterday = new Date(time_stamp);
    yesterday.setDate(yesterday.getDate() - 1);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    try {
        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^get masters^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        let platform_code_array = [];
        const product_master = await ProductMasterModel.find().select("asin title sub_category");
        for (let product of product_master) {
            platform_code_array.push(product.asin);
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^highly_promotable_products_status_array^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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
                    total_doc_no: { $sum: 1 },
                    sub_cat_rank: { $sum: "$sub_cat_rank" },
                }
            },
            {
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_doc_no"] }, 100] }, }, },
                    // sub_cat_rank: { $cond: { if: { $eq: ["$sub_cat_rank", 0] }, then: 0, else: { $multiply: [{ $divide: ['$sub_cat_rank', "$sub_cat_rank"] }, 100] }, }, },
                    sub_cat_rank:"$sub_cat_rank"
                }
            },
            {
                $unset: ["available_location_no", "total_doc_no"]
            }
        ])
        console.log(osaArray)
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
        let highly_promotable_products_status_array = [];

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
                    highly_promotable_products_status_array.push({
                        platform_code: _id,
                        highly_promotable_status: true
                    })
                } else {
                    highly_promotable_products_status_array.push({
                        platform_code: _id,
                        highly_promotable_status: false
                    })
                }
            }
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^SVD_and_BAU_avg_sales_array^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        const todaysDateTime = new Date().toISOString();
        const inputDate = todaysDateTime.split("T")[0] + "T" + "00:00:00.000Z";
        const yesterday = new Date(inputDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const inputDateNumber = new Date(inputDate).getDate();
        const firstDateOfMonth = new Date(inputDate);
        firstDateOfMonth.setDate(inputDateNumber - (inputDateNumber - 1));
        const seventhDateOfMonth = new Date(inputDate);
        seventhDateOfMonth.setDate(inputDateNumber - (inputDateNumber - 7));
        const inputDateNum = new Date(inputDate).getDate();
        let divNum;
        if (inputDateNum >= 2 && inputDateNum <= 8) {
            divNum = yesterday.getDate()
        } else if (inputDateNum >= 8) {
            divNum = 7
        } else if (inputDateNum < 2) {
            divNum = null
        }
        let divNum2;
        if (inputDateNum > 8) {
            divNum2 = yesterday.getDate() - 7
        } else if (inputDateNum <= 8) {
            divNum2 = null;
        }
        const SVD_and_BAU_avg_sales_array = await ProductAdsModel.aggregate([
            {
                $match: {
                    platform_code: { $in: platform_code_array },
                    time_stamp: { $gte: firstDateOfMonth, $lte: yesterday }

                }
            },
            {
                $group: {
                    _id: "$platform_code",
                    cost: { $sum: "$cost" },
                    sum_of_SVD: { $sum: { $cond: { if: { $lte: ["$time_stamp", seventhDateOfMonth] }, then: "$attributed_sales_14_d", else: 0 } } },
                    sum_of_BAU: { $sum: { $cond: { if: { $gt: ["$time_stamp", seventhDateOfMonth] }, then: "$attributed_sales_14_d", else: 0 } } },
                }

            },
            {
                $project: {
                    SVD_avg_sales: { $cond: { if: { $ne: [divNum, null] }, then: { $divide: ["$sum_of_SVD", divNum] }, else: 0 } },
                    BAU_avg_sales: { $cond: { if: { $ne: [divNum2, null] }, then: { $divide: ["$sum_of_BAU", divNum2] }, else: 0 } },
                }
            }
        ]);

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^yesterday_and_day_before_yesterdays_AMS_data^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        const yesterday_and_day_before_yesterdays_AMS_data = await ProductAdsModel.aggregate([
            {
                $match: {
                    platform_code: { $in: platform_code_array },
                    time_stamp: { $gte: dayBeforeYesterday, $lte: yesterday }

                }
            },
            {
                $group: {
                    _id: {
                        time_stamp: "$time_stamp",
                        platform_code: "$platform_code"
                    },
                    cost: { $sum: "$cost" },
                    attributed_sales_14_d: { $sum: "$attributed_sales_14_d" },
                    attributed_units_ordered_14_d: { $sum: "$attributed_units_ordered_14_d" },
                    impressions: { $sum: "$impressions" },
                    clicks: { $sum: "$clicks" }
                }

            },
            {
                $group: {
                    _id: "$_id.time_stamp",
                    "status": {
                        $push: {
                            platform_code: "$_id.platform_code",
                            cost: "$cost",
                            attributed_sales_14_d: "$attributed_sales_14_d",
                            attributed_units_ordered_14_d: "$attributed_units_ordered_14_d",
                            impressions: "$impressions",
                            clicks: "$clicks"
                        }
                    }
                }

            },
            {
                $sort: { "_id": 1 }
            },
        ]);
        let y_and_day_before_y_AMS_data_array = [];
        const [productAdsArrayDayBeforeYesterdaysEl, productAdsArrayYesterdaysEl] = yesterday_and_day_before_yesterdays_AMS_data;//If product array is undefined then

        for (let yesterdaysEl of productAdsArrayYesterdaysEl.status) {
            const { platform_code } = yesterdaysEl;
            const [dayBeforeYesterdaysEl] = productAdsArrayDayBeforeYesterdaysEl.status.filter(dBYEl => dBYEl.platform_code === platform_code);
            if (dayBeforeYesterdaysEl) {
                const sales = yesterdaysEl.attributed_sales_14_d;
                const sales_diff = yesterdaysEl.attributed_sales_14_d - dayBeforeYesterdaysEl.attributed_sales_14_d;
                const sales_percesntage_change = (sales_diff / dayBeforeYesterdaysEl.attributed_sales_14_d) * 100;
                const impressions_diff = yesterdaysEl.impressions - dayBeforeYesterdaysEl.impressions;
                const clicks_diff = yesterdaysEl.clicks - dayBeforeYesterdaysEl.clicks;
                const sales_flow = calculateChange(sales_diff);
                const impressions_flow = calculateChange(impressions_diff);
                const clicks_flow = calculateChange(clicks_diff);
                const day_before_yesterdays_conversion = dayBeforeYesterdaysEl.attributed_units_ordered_14_d / dayBeforeYesterdaysEl.clicks;
                const yesterdays_conversion = yesterdaysEl.attributed_units_ordered_14_d / yesterdaysEl.clicks;
                const conversion_diff = yesterdays_conversion - day_before_yesterdays_conversion;
                const conversion_percentage = yesterdays_conversion * 100;
                const conversion_flow = calculateChange(conversion_diff);
                const day_before_yesterdays_ctr = dayBeforeYesterdaysEl.clicks / dayBeforeYesterdaysEl.impressions;
                const yesterdays_ctr = yesterdaysEl.clicks / yesterdaysEl.impressions;
                const ctr_diff = yesterdays_ctr - day_before_yesterdays_ctr;
                const ctr_percentage = yesterdays_ctr * 100;
                const ctr_flow = calculateChange(ctr_diff);
                y_and_day_before_y_AMS_data_array.push({
                    platform_code,
                    sales,
                    sales_flow,
                    sales_diff,
                    sales_percesntage_change,
                    cost: yesterdaysEl.cost,
                    impressions: yesterdaysEl.impressions,
                    impressions_flow,
                    clicks: yesterdaysEl.clicks,
                    clicks_flow,
                    conversion_percentage,
                    conversion_flow,
                    ctr_percentage,
                    ctr_flow
                })
            }
        }


        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^RESULTS^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        let product_wise_status_array = []
        for (let product of product_master) {
            const { title, sub_category } = product;
            let product_obj = {
                title,
                sub_category
            };
            const platform_code = product.asin;
            const [highly_promotable_products_status_obj] = highly_promotable_products_status_array.filter(el => el.platform_code === platform_code);
            if (highly_promotable_products_status_obj) {
                product_obj = {
                    ...product_obj,
                    ...highly_promotable_products_status_obj
                }
            }
            const [SVD_and_BAU_avg_sales_obj] = SVD_and_BAU_avg_sales_array.filter(el => el._id === platform_code);
            if (SVD_and_BAU_avg_sales_obj) {

                product_obj = {
                    ...product_obj,
                    SVD_avg_sales: SVD_and_BAU_avg_sales_obj.SVD_avg_sales,
                    BAU_avg_sales: SVD_and_BAU_avg_sales_obj.SVD_avg_sales
                }
            }
            const [y_and_day_before_y_AMS_data_obj] = y_and_day_before_y_AMS_data_array.filter(el => el.platform_code === platform_code);
            if (y_and_day_before_y_AMS_data_obj) {
                product_obj = {
                    ...product_obj,
                    ...y_and_day_before_y_AMS_data_obj
                }
            }

            product_wise_status_array.push(product_obj);
        }



        res.status(200).json({
            status: "success",
            data: {
                // time_stamp: productAdsArrayYesterdaysEl._id,
                // y_and_day_before_y_AMS_data_array,
                // SVD_and_BAU_avg_sales_array,
                // highly_promotable_products_status_array,
                // brandHealthArray
                // osaArray
                // yesterday_and_day_before_yesterdays_AMS_data
                product_wise_status_array
            }
        });


    } catch (error) {
        console.log(error);
    }
}

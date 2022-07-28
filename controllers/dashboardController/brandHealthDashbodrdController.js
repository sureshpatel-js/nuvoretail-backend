const BrandHealthModel = require("../../models/brandHealthModel");
const ProductMasterModel = require("../../models/productMasterModel");
const ProductAdsModel = require("../../models/productAdsModel");
const OsaModel = require("../../models/osaModel");
const AppError = require("../../utils/errorHandling/AppError");
const { validateBrandHealthDashboardBody } = require("../../validate/validateDashboard/validateBrandHealthDashboard");
const { calculateChange, calculateProductDeal } = require("../../utils/commonFunction/dashboardFunction");
const { roundOffToTwoDecimal, addNumbersInArray, calculatePercentageChange, divTwoNum } = require("../../utils/commonFunction/commonFunction");



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


exports.getBrandWiseStatus = async (req, res, next) => {
    const { time_stamp } = req.body;
    const yesterday1 = new Date(time_stamp);
    const dayBeforeYesterday = new Date(time_stamp);
    yesterday1.setDate(yesterday1.getDate() - 1);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    try {

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^get masters^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        let platform_code_array = [];
        const product_master = await ProductMasterModel.find().select("asin title sub_category mrp");
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
                    sub_cat_rank: { $avg: "$sub_cat_rank" },
                    main_cat_rank: { $avg: "$main_cat_rank" },
                    sp: { $avg: "$sp" },
                    sum_of_buy_box: { $sum: { $cond: { if: { $and: [{ $eq: ["$status", true] }, { $eq: ["$authorized_seller", true] }] }, then: 1, else: 0 } } },

                }
            },
            {
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_doc_no"] }, 100] }, }, },
                    sub_cat_rank: "$sub_cat_rank",
                    main_cat_rank: "$main_cat_rank",
                    sp: "$sp",
                    buy_box_percentage: { $multiply: [{ $divide: ["$sum_of_buy_box", "$total_doc_no"] }, 100] },

                }
            },
            {
                $unset: ["available_location_no", "total_doc_no", "sum_of_buy_box"]
            }
        ]);

        const yesterdayOsaArray = await OsaModel.aggregate([
            {
                $match: {
                    time_stamp: new Date(yesterday1)
                }
            }
            ,
            {
                $group: {
                    _id: "$platform_code",
                    available_location_no: { $sum: { $cond: { if: { $eq: ["$status", true] }, then: 1, else: 0 } } },
                    total_doc_no: { $sum: 1 },
                    sub_cat_rank: { $avg: "$sub_cat_rank" },
                    main_cat_rank: { $avg: "$main_cat_rank" },
                    sp: { $avg: "$sp" },
                    sum_of_buy_box: { $sum: { $cond: { if: { $and: [{ $eq: ["$status", true] }, { $eq: ["$authorized_seller", true] }] }, then: 1, else: 0 } } },

                }
            },
            {
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_doc_no"] }, 100] }, }, },
                    sub_cat_rank: "$sub_cat_rank",
                    main_cat_rank: "$main_cat_rank",
                    sp: "$sp",
                    buy_box_percentage: { $multiply: [{ $divide: ["$sum_of_buy_box", "$total_doc_no"] }, 100] },

                }
            },
            {
                $unset: ["total_doc_no"]
            }
        ]);


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
            }
        ])
        let highly_promotable_products_status_array = [];

        for (let osaObj of osaArray) {
            const { _id, sub_cat_rank, main_cat_rank, sp, buy_box_percentage } = osaObj;
            const bhObj = brandHealthArray.filter(bhEl => bhEl._id === _id);
            const [productMasterObje] = product_master.filter(pmEl => pmEl.asin === _id);
            const [yesterdayOsaObj] = yesterdayOsaArray.filter(yoEl => yoEl._id === _id);
            let promo = null;
            let yesterdays_promo = null;
            if (productMasterObje && yesterdayOsaObj) {
                const { mrp } = productMasterObje;
                promo = calculateProductDeal(mrp, sp);
                yesterdays_promo = calculateProductDeal(mrp, yesterdayOsaObj.sp);
            }
            if (bhObj.length > 0) {
                const { available } = osaObj;
                const {
                    out_of_three_top_reviews_positive,
                    out_of_three_top_reviews_negative,
                    out_of_three_most_recent_positive,
                    out_of_three_most_recent_negative,
                    rating,
                    no_of_rating
                } = bhObj[0];
                const commonObj = {
                    platform_code: _id,
                    sub_cat_rank,
                    yesterdays_sub_cat_rank: yesterdayOsaObj.sub_cat_rank,
                    main_cat_rank,
                    yesterdays_main_cat_rank: yesterdayOsaObj.main_cat_rank,
                    available,
                    yesterdays_availeble: yesterdayOsaObj.available,
                    out_of_three_top_reviews_negative,
                    out_of_three_most_recent_negative,
                    promo,
                    yesterdays_promo,
                    rating,
                    no_of_rating,
                    buy_box_percentage,
                    yesterdays_buy_box_percentage: yesterdayOsaObj.buy_box_percentage
                }
                if (available > 0 && out_of_three_top_reviews_positive === 3 && out_of_three_most_recent_positive === 3 && rating >= 4 && no_of_rating > 10) {

                    commonObj.highly_promotable_status = true;
                    commonObj.promotable = "high"
                } else if (available === 0 || out_of_three_top_reviews_negative === 3 || out_of_three_most_recent_negative === 3 || rating < 4 || no_of_rating < 10) {

                    commonObj.highly_promotable_status = false;
                    commonObj.promotable = "non";
                } else {
                    commonObj.highly_promotable_status = false;
                    commonObj.promotable = "low";
                }
                highly_promotable_products_status_array.push(commonObj);

            }
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^SVD_and_BAU_avg_sales_array^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


        const inputDate = new Date(time_stamp);
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
                const sales = roundOffToTwoDecimal(yesterdaysEl.attributed_sales_14_d);
                const day_before_yesterdays_sales = roundOffToTwoDecimal(dayBeforeYesterdaysEl.attributed_sales_14_d);
                //const sales_diff = roundOffToTwoDecimal(yesterdaysEl.attributed_sales_14_d - dayBeforeYesterdaysEl.attributed_sales_14_d);
                //const sales_percesntage_change = roundOffToTwoDecimal((sales_diff / dayBeforeYesterdaysEl.attributed_sales_14_d) * 100);
                // const impressions_diff = yesterdaysEl.impressions - dayBeforeYesterdaysEl.impressions;
                // const clicks_diff = yesterdaysEl.clicks - dayBeforeYesterdaysEl.clicks;
                // const sales_flow = calculateChange(sales_diff);
                // const impressions_flow = calculateChange(impressions_diff);
                // const clicks_flow = calculateChange(clicks_diff);
                const day_before_yesterdays_conversion = dayBeforeYesterdaysEl.attributed_units_ordered_14_d / dayBeforeYesterdaysEl.clicks;
                const yesterdays_conversion = yesterdaysEl.attributed_units_ordered_14_d / yesterdaysEl.clicks;
                const conversion_diff = yesterdays_conversion - day_before_yesterdays_conversion;
                const conversion_percentage = roundOffToTwoDecimal(yesterdays_conversion * 100);
                const conversion_flow = calculateChange(conversion_diff);
                const day_before_yesterdays_ctr = dayBeforeYesterdaysEl.clicks / dayBeforeYesterdaysEl.impressions;
                const yesterdays_ctr = yesterdaysEl.clicks / yesterdaysEl.impressions;
                const ctr_diff = yesterdays_ctr - day_before_yesterdays_ctr;
                const ctr_percentage = roundOffToTwoDecimal(yesterdays_ctr * 100);
                const ctr_flow = calculateChange(ctr_diff);

                y_and_day_before_y_AMS_data_array.push({
                    platform_code,
                    sales,
                    day_before_yesterdays_sales,
                    // sales_flow,
                    // sales_diff,
                    // sales_percesntage_change,
                    cost: yesterdaysEl.cost,
                    day_before_yesterdays_cost: dayBeforeYesterdaysEl.cost,
                    impressions: yesterdaysEl.impressions,
                    day_before_yesterdays_impressions: dayBeforeYesterdaysEl.impressions,
                    // impressions_flow,
                    clicks: yesterdaysEl.clicks,
                    day_before_yesterdays_clicks: dayBeforeYesterdaysEl.clicks,
                    //  clicks_flow,
                    conversion_percentage,
                    conversion_flow,
                    ctr_percentage,
                    ctr_flow,
                    y_attributed_units_ordered_14_d: yesterdaysEl.attributed_units_ordered_14_d,
                    dby_attributed_units_ordered_14_d: dayBeforeYesterdaysEl.attributed_units_ordered_14_d
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
                    SVD_avg_sales: roundOffToTwoDecimal(SVD_and_BAU_avg_sales_obj.SVD_avg_sales),
                    BAU_avg_sales: roundOffToTwoDecimal(SVD_and_BAU_avg_sales_obj.BAU_avg_sales)
                }
            }
            const [y_and_day_before_y_AMS_data_obj] = y_and_day_before_y_AMS_data_array.filter(el => el.platform_code === platform_code);
            if (y_and_day_before_y_AMS_data_obj) {
                product_obj = {
                    ...product_obj,
                    ...y_and_day_before_y_AMS_data_obj,
                    product_ads_data: true
                }
            } else {
                product_obj = {
                    ...product_obj,
                    product_ads_data: false
                }
            }

            product_wise_status_array.push(product_obj);
        }


        const master_brands = await ProductMasterModel.aggregate([
            {
                $group: {
                    _id: "$sub_brand",
                    platform_codes: { $push: "$asin" }

                }
            }
        ])


        let brand_wise_status_array = [];

        for (let brand of master_brands) {
            const { _id, platform_codes } = brand;
            let obj_sales = 0;
            let obj_day_before_yesterdays_sales = 0;
            let obj_SVD_avg_sales = 0;
            let obj_BAU_avg_sales = 0;
            let obj_cost = 0;
            let obj_day_before_yesterdays_cost = 0;
            let obj_impressions = 0;
            let obj_day_before_yesterdays_impressions = 0;
            let obj_clicks = 0;
            let obj_day_before_yesterdays_clicks = 0;
            let obj_y_attributed_units_ordered_14_d = 0;
            let obj_dby_attributed_units_ordered_14_d = 0;

            let obj_main_cat_rank = [];
            let obj_yesterdays_main_cat_rank = [];
            let obj_sub_cat_rank = [];
            let obj_yesterdays_sub_cat_rank = [];
            let obj_platform_codes = [];
            let obj_rating_array = []
            let obj_available_percentage_array = [];
            let obj_yesterdays_available_percentage_array = [];
            let obj_buy_box_array = [];
            let obj_yesterdays_buy_box_array = [];
            let obj_promo_array = [];
            let obj_yesterdays_promo_array = []

            for (let platform of platform_codes) {
                const [product] = product_wise_status_array.filter(el => el.platform_code === platform);
                //productads table data
                if (product.product_ads_data) {
                    obj_sales += product.sales;
                    obj_day_before_yesterdays_sales += product.day_before_yesterdays_sales;
                    obj_SVD_avg_sales += product.SVD_avg_sales;
                    obj_BAU_avg_sales += product.BAU_avg_sales;
                    obj_cost += product.cost;
                    obj_day_before_yesterdays_cost += product.day_before_yesterdays_cost;
                    obj_impressions += product.impressions;
                    obj_day_before_yesterdays_impressions += product.day_before_yesterdays_impressions;
                    obj_clicks += product.clicks;
                    obj_day_before_yesterdays_clicks += product.day_before_yesterdays_clicks;
                    obj_y_attributed_units_ordered_14_d += product.y_attributed_units_ordered_14_d;
                    obj_dby_attributed_units_ordered_14_d += product.dby_attributed_units_ordered_14_d;
                }
                //osa and brandhealth table data
                obj_platform_codes.push(product.platform_code);
                obj_main_cat_rank.push(product.main_cat_rank);
                obj_yesterdays_main_cat_rank.push(product.yesterdays_main_cat_rank);
                obj_sub_cat_rank.push(product.sub_cat_rank);
                obj_yesterdays_sub_cat_rank.push(product.yesterdays_sub_cat_rank);
                obj_rating_array.push(product.rating);
                obj_available_percentage_array.push(product.available);
                obj_yesterdays_available_percentage_array.push(product.yesterdays_availeble);
                obj_buy_box_array.push(product.buy_box_percentage);
                obj_yesterdays_buy_box_array.push(product.yesterdays_buy_box_percentage);
                obj_promo_array.push(product.promo);
                obj_yesterdays_promo_array.push(product.yesterdays_promo);
            }
            const main_cat_rank = Math.round(addNumbersInArray(obj_main_cat_rank) / obj_main_cat_rank.length);
            const yesterdays_main_cat_rank = Math.round(addNumbersInArray(obj_yesterdays_main_cat_rank) / obj_yesterdays_main_cat_rank.length);
            const sub_cat_rank = Math.round(addNumbersInArray(obj_sub_cat_rank) / obj_sub_cat_rank.length);
            const yesterdays_sub_cat_rank = Math.round(addNumbersInArray(obj_yesterdays_sub_cat_rank) / obj_yesterdays_sub_cat_rank.length);
            const rating = addNumbersInArray(obj_rating_array) / obj_rating_array.length;
            const available = addNumbersInArray(obj_available_percentage_array) / obj_available_percentage_array.length;
            const yesterdays_availeble = addNumbersInArray(obj_yesterdays_available_percentage_array) / obj_yesterdays_available_percentage_array.length;
            const buy_box = addNumbersInArray(obj_buy_box_array) / obj_buy_box_array.length;
            const yesterdays_buy_box = addNumbersInArray(obj_yesterdays_buy_box_array) / obj_yesterdays_buy_box_array.length;
            const promo = addNumbersInArray(obj_promo_array) / obj_promo_array.length;
            const yesterdays_promo = addNumbersInArray(obj_yesterdays_promo_array) / obj_yesterdays_promo_array.length;

            const main_cat_rank_diff = main_cat_rank - yesterdays_main_cat_rank;
            const main_cat_rank_flow = calculateChange(main_cat_rank_diff);
            const sub_cat_rank_diff = sub_cat_rank - yesterdays_sub_cat_rank;
            const sub_cat_rank_flow = calculateChange(sub_cat_rank_diff);
            const available_diff = available - yesterdays_availeble;
            const available_flow = calculateChange(available_diff);
            const buy_box_diff = buy_box - yesterdays_buy_box;
            const buy_box_flow = calculateChange(buy_box_diff);
            const promo_diff = promo - yesterdays_promo;
            const promo_flow = calculateChange(promo_diff);
            //productads table data
            const sale_flow = calculateChange(obj_sales - obj_day_before_yesterdays_sales);
            const ctr = divTwoNum(obj_clicks, obj_impressions) * 100;
            const dby_ctr = divTwoNum(obj_day_before_yesterdays_clicks, obj_day_before_yesterdays_impressions) * 100;
            const ctr_diff = ctr - dby_ctr;
            const ctr_flow = calculateChange(ctr_diff);
            const conversion = divTwoNum(obj_y_attributed_units_ordered_14_d, obj_clicks) * 100;
            const dby_conversion = divTwoNum(obj_dby_attributed_units_ordered_14_d, obj_day_before_yesterdays_clicks) * 100;
            const conversion_diff = conversion - dby_conversion;
            const conversion_flow = calculateChange(conversion_diff);

            const sales_percesntage_change = roundOffToTwoDecimal(calculatePercentageChange(obj_day_before_yesterdays_sales, obj_sales));
            const cost_diff = obj_cost - obj_day_before_yesterdays_cost;
            const cost_flow = calculateChange(cost_diff);
            const impressions_diff = obj_impressions - obj_day_before_yesterdays_impressions;
            const impressions_flow = calculateChange(impressions_diff);
            const clicks_diff = obj_clicks - obj_day_before_yesterdays_clicks;
            const clicks_flow = calculateChange(clicks_diff);

            const sales = roundOffToTwoDecimal(obj_sales);
            const obj = {
                brand_name: _id,
                sales,
                sale_flow,
                sales_percesntage_change,
                SVD_avg_sales: obj_SVD_avg_sales,
                BAU_avg_sales: obj_BAU_avg_sales,
                platform_codes: obj_platform_codes,
                main_cat_rank,
                main_cat_rank_flow,
                sub_cat_rank,
                sub_cat_rank_flow,
                rating,
                cost: obj_cost,
                cost_flow,
                available,
                available_flow,
                buy_box,
                buy_box_flow,
                promo: roundOffToTwoDecimal(promo),
                promo_flow,
                impressions: obj_impressions,
                impressions_flow,
                clicks: obj_clicks,
                clicks_flow,
                ctr: roundOffToTwoDecimal(ctr),
                ctr_flow,
                conversion: roundOffToTwoDecimal(conversion),
                conversion_flow
            }
            brand_wise_status_array.push(obj);
        }

        res.status(200).json({
            status: "success",
            data: {
                brand_wise_status_array
            }
        });


    } catch (error) {
        console.log(error);
    }
}

exports.getProductWiseStatus = async (req, res, next) => {
    const { time_stamp } = req.body;
    const yesterday1 = new Date(time_stamp);
    const dayBeforeYesterday = new Date(time_stamp);
    yesterday1.setDate(yesterday1.getDate() - 1);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    try {

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^get masters^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        let platform_code_array = [];
        const product_master = await ProductMasterModel.find().select("asin title sub_category mrp");
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
                    sub_cat_rank: { $avg: "$sub_cat_rank" },
                    main_cat_rank: { $avg: "$main_cat_rank" },
                    sp: { $avg: "$sp" },
                    avg_delivery_days: { $avg: "$delivery_days" },
                    max_delivery_days: { $max: "$delivery_days" },
                    deal: { $push: { $cond: { if: { $ne: ["$deal", null] }, then: "$deal", else: "$$REMOVE" } } },
                    sub_cat: { $push: { $cond: { if: { $ne: ["$sub_cat", null] }, then: "$sub_cat", else: "$$REMOVE" } } },
                    sum_of_buy_box: { $sum: { $cond: { if: { $and: [{ $eq: ["$status", true] }, { $eq: ["$authorized_seller", true] }] }, then: 1, else: 0 } } },

                },
            },
            {
                $project: {
                    available: { $cond: { if: { $eq: ["$available_location_no", 0] }, then: 0, else: { $multiply: [{ $divide: ['$available_location_no', "$total_doc_no"] }, 100] }, }, },
                    sub_cat_rank: "$sub_cat_rank",
                    main_cat_rank: "$main_cat_rank",
                    sp: "$sp",
                    avg_delivery_days: "$avg_delivery_days",
                    max_delivery_days: "$max_delivery_days",
                    deal_array: "$deal",
                    sub_cat_array: "$sub_cat",
                    buy_box_percentage: { $multiply: [{ $divide: ["$sum_of_buy_box", "$total_doc_no"] }, 100] },


                }
            },
            {
                $unset: ["available_location_no", "total_doc_no", "sum_of_buy_box"]
            }
        ]);

        const yesterdayOsaArray = await OsaModel.aggregate([
            {
                $match: {
                    time_stamp: new Date(yesterday1)
                }
            }
            ,
            {
                $group: {
                    _id: "$platform_code",
                    available_location_no: { $sum: { $cond: { if: { $eq: ["$status", true] }, then: 1, else: 0 } } },
                    total_doc_no: { $sum: 1 },
                    sub_cat_rank: { $avg: "$sub_cat_rank" },
                    main_cat_rank: { $avg: "$main_cat_rank" },
                    sum_of_buy_box: { $sum: { $cond: { if: { $and: [{ $eq: ["$status", true] }, { $eq: ["$authorized_seller", true] }] }, then: 1, else: 0 } } },
                    sp: { $avg: "$sp" }
                }
            },
            {
                $project: {
                    sub_cat_rank: "$sub_cat_rank",
                    main_cat_rank: "$main_cat_rank",
                    buy_box_percentage: { $multiply: [{ $divide: ["$sum_of_buy_box", "$total_doc_no"] }, 100] },
                    sp: "$sp"
                }
            },
            {
                $unset: ["sum_of_buy_box"]
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
                    no_of_rating: { $avg: "$no_of_rating" },
                    no_of_review: { $avg: "$no_of_review" }
                }
            }
        ])
        let highly_promotable_products_status_array = [];

        for (let osaObj of osaArray) {
            const { _id, available, sub_cat_rank, main_cat_rank, sp, avg_delivery_days, max_delivery_days, deal_array, sub_cat_array, buy_box_percentage } = osaObj;
            const bhObj = brandHealthArray.filter(bhEl => bhEl._id === _id);
            const [productMasterObje] = product_master.filter(pmEl => pmEl.asin === _id);
            const [yesterdayOsaObj] = yesterdayOsaArray.filter(yoEl => yoEl._id === _id);
            let promo = null;
            let promo_change = null;
            let buy_box_flow = null;
            let available_flow = null;
            if (productMasterObje && yesterdayOsaObj) {
                const { mrp } = productMasterObje;
                promo = calculateProductDeal(mrp, sp);
                const yesterday_promo = calculateProductDeal(mrp, yesterdayOsaObj.sp);
                const promo_diff = promo - yesterday_promo;
                promo_change = calculateChange(promo_diff);
                const buy_box_diff = buy_box_percentage - yesterdayOsaObj.buy_box_percentage;
                buy_box_flow = calculateChange(buy_box_diff);
                const available_diff = available - yesterdayOsaObj.available;
                available_flow = calculateChange(available_diff);
            }
            if (bhObj.length > 0) {
                const {
                    out_of_three_top_reviews_positive,
                    out_of_three_top_reviews_negative,
                    out_of_three_most_recent_positive,
                    out_of_three_most_recent_negative,
                    rating,
                    no_of_rating,
                    no_of_review
                } = bhObj[0];
                const promo_percentage = roundOffToTwoDecimal(promo);
                const commonObj = {
                    platform_code: _id,
                    sub_cat_rank,
                    main_cat_rank,
                    available,
                    out_of_three_top_reviews_negative,
                    out_of_three_most_recent_negative,
                    promo_percentage,
                    promo_change,
                    rating,
                    no_of_rating,
                    avg_delivery_days,
                    max_delivery_days,
                    deal: deal_array[0],
                    sub_cat: sub_cat_array[0],
                    no_of_review,
                    buy_box_percentage,
                    buy_box_flow,
                    available_flow
                }

                if (available > 0 && out_of_three_top_reviews_positive === 3 && out_of_three_most_recent_positive === 3 && rating >= 4 && no_of_rating > 10) {

                    commonObj.highly_promotable_status = true;
                    commonObj.promotable = "high"
                } else if (available === 0 || out_of_three_top_reviews_negative === 3 || out_of_three_most_recent_negative === 3 || rating < 4 || no_of_rating < 10) {

                    commonObj.highly_promotable_status = false;
                    commonObj.promotable = "non";
                } else {
                    commonObj.highly_promotable_status = false;
                    commonObj.promotable = "low";
                }
                highly_promotable_products_status_array.push(commonObj);

            }
        }

        //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^SVD_and_BAU_avg_sales_array^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


        const inputDate = new Date(time_stamp);
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
                const sales = roundOffToTwoDecimal(yesterdaysEl.attributed_sales_14_d);
                const sales_diff = roundOffToTwoDecimal(yesterdaysEl.attributed_sales_14_d - dayBeforeYesterdaysEl.attributed_sales_14_d);
                const sales_percesntage_change = roundOffToTwoDecimal(calculatePercentageChange(dayBeforeYesterdaysEl.attributed_sales_14_d, yesterdaysEl.attributed_sales_14_d));
                const impressions_diff = yesterdaysEl.impressions - dayBeforeYesterdaysEl.impressions;
                const clicks_diff = yesterdaysEl.clicks - dayBeforeYesterdaysEl.clicks;
                const sales_flow = calculateChange(sales_diff);
                const impressions_flow = calculateChange(impressions_diff);
                const clicks_flow = calculateChange(clicks_diff);
                const day_before_yesterdays_conversion = divTwoNum(dayBeforeYesterdaysEl.attributed_units_ordered_14_d, dayBeforeYesterdaysEl.clicks) * 100;
                const yesterdays_conversion = divTwoNum(yesterdaysEl.attributed_units_ordered_14_d, yesterdaysEl.clicks) * 100;
                const conversion_diff = yesterdays_conversion - day_before_yesterdays_conversion;
                const conversion_flow = calculateChange(conversion_diff);
                const day_before_yesterdays_ctr = divTwoNum(dayBeforeYesterdaysEl.clicks, dayBeforeYesterdaysEl.impressions) * 100;
                const yesterdays_ctr = divTwoNum(yesterdaysEl.clicks, yesterdaysEl.impressions) * 100;
                const ctr_diff = yesterdays_ctr - day_before_yesterdays_ctr;
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
                    conversion_percentage: roundOffToTwoDecimal(yesterdays_conversion),
                    conversion_flow,
                    ctr_percentage: roundOffToTwoDecimal(yesterdays_ctr),
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
                    SVD_avg_sales: roundOffToTwoDecimal(SVD_and_BAU_avg_sales_obj.SVD_avg_sales),
                    BAU_avg_sales: roundOffToTwoDecimal(SVD_and_BAU_avg_sales_obj.BAU_avg_sales)
                }
            }
            const [y_and_day_before_y_AMS_data_obj] = y_and_day_before_y_AMS_data_array.filter(el => el.platform_code === platform_code);
            if (y_and_day_before_y_AMS_data_obj) {
                product_obj = {
                    ...product_obj,
                    ...y_and_day_before_y_AMS_data_obj
                }
            } else {
                product_obj = {
                    ...product_obj,
                    sales: 0,
                    sales_flow: "zero",
                    sales_diff: 0,
                    sales_percesntage_change: 0,
                    cost: 0,
                    impressions: 0,
                    impressions_flow: "zero",
                    clicks: 0,
                    clicks_flow: "zero",
                    conversion_percentage: 0,
                    conversion_flow: "zero",
                    ctr_percentage: 0,
                    ctr_flow: "zero"
                }
            }

            product_wise_status_array.push(product_obj);
        }

        res.status(200).json({
            status: "success",
            data: {
                product_wise_status_array
            }
        });


    } catch (error) {
        console.log(error);
    }
}




exports.getAdvSalesAndAcos = async (req, res, next) => {
    const { time_stamp } = req.body;
    const date = new Date(time_stamp);
    const yesterday = new Date(time_stamp);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateBefore30Days = new Date(time_stamp);
    dateBefore30Days.setDate(dateBefore30Days.getDate() - 31);
    try {

        const adv_and_acos_array = await ProductAdsModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: dateBefore30Days, $lte: yesterday },
                    platform_code: { $in: req.body.platform_code }
                }
            },
            {
                $group: {
                    _id: "$time_stamp",
                    adv_sales: { $sum: "$attributed_sales_14_d" },
                    cost: { $sum: "$cost" },
                }
            },
            {
                $project: {
                    adv_sales: "$adv_sales",
                    acos_percentage: { $multiply: [{ $divide: ["$cost", "$adv_sales"] }, 100] },
                }
            },
            {
                $unset: ["cost"]
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        res.status(200).json({
            status: "success",
            data: {
                adv_and_acos_array
            }
        })
    } catch (error) {

    }



}

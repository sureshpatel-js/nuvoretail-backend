const CampaignReportModel = require("../../models/campaignReportModel");
const DashboardDataModel = require("../../models/dashboardDataModel");
const { calculateChange, calculateNegativeOfChange } = require("../../utils/commonFunction/dashboardFunction");
const { calculatePercentageChange, divTwoNum, roundOffToTwoDecimal, getMontheInText, getYesterdayAndFirstDayOfMonth, getDaysInMonth } = require("../../utils/commonFunction/commonFunction");
exports.getTileData = async (req, res, next) => {
    const { time_stamp, campaign_type_array } = req.body;
    const yesterday = new Date(time_stamp);
    const dayBeforeYesterday = new Date(time_stamp);
    const preEightDayFromYesterday = new Date(time_stamp);
    yesterday.setDate(yesterday.getDate() - 1);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    preEightDayFromYesterday.setDate(preEightDayFromYesterday.getDate() - 8);

    try {



        const data = await CampaignReportModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: preEightDayFromYesterday, $lte: yesterday },
                    campaign_type: { $in: campaign_type_array }
                }
            },
            {
                $group: {
                    _id: "$client_profile_id",
                    //Sales
                    yesterdays_sales: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    },
                    day_before_yesterdays_sales: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_sales: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    },
                    //cost or spend
                    yesterdays_cost: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$cost", else: 0 } }
                    },
                    day_before_yesterdays_cost: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$cost", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_cost: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$cost", else: 0 } }
                    },
                    //Orders
                    yesterdays_orders: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$attributed_units_ordered_14_d", else: 0 } }
                    },
                    day_before_yesterdays_orders: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$attributed_units_ordered_14_d", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_orders: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$attributed_units_ordered_14_d", else: 0 } }
                    },
                    //Clicks
                    yesterdays_clicks: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$clicks", else: 0 } }
                    },
                    day_before_yesterdays_clicks: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$clicks", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_clicks: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$clicks", else: 0 } }
                    },
                    //Impressions
                    yesterdays_impressions: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$impressions", else: 0 } }
                    },
                    day_before_yesterdays_impressions: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$impressions", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_impressions: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$impressions", else: 0 } }
                    },
                }
            },
            {
                $project: {
                    //sales
                    yesterdays_sales: "$yesterdays_sales",
                    day_before_yesterdays_sales: "$day_before_yesterdays_sales",
                    from_day_before_yesterday_pre_seven_days_avg_sales: { $divide: ["$from_day_before_yesterday_pre_seven_days_sales", 7] },
                    //sales
                    yesterdays_cost: "$yesterdays_cost",
                    day_before_yesterdays_cost: "$day_before_yesterdays_cost",
                    from_day_before_yesterday_pre_seven_days_avg_cost: { $divide: ["$from_day_before_yesterday_pre_seven_days_cost", 7] },
                    //Orders
                    yesterdays_orders: "$yesterdays_orders",
                    day_before_yesterdays_orders: "$day_before_yesterdays_orders",
                    from_day_before_yesterday_pre_seven_days_avg_orders: { $divide: ["$from_day_before_yesterday_pre_seven_days_orders", 7] },
                    //Clicks
                    yesterdays_clicks: "$yesterdays_clicks",
                    day_before_yesterdays_clicks: "$day_before_yesterdays_clicks",
                    from_day_before_yesterday_pre_seven_days_avg_clicks: { $divide: ["$from_day_before_yesterday_pre_seven_days_clicks", 7] },

                    //Impressions
                    yesterdays_impressions: "$yesterdays_impressions",
                    day_before_yesterdays_impressions: "$day_before_yesterdays_impressions",
                    from_day_before_yesterday_pre_seven_days_avg_impressions: { $divide: ["$from_day_before_yesterday_pre_seven_days_impressions", 7] },


                }
            }
        ])
        const {
            //Sales
            yesterdays_sales,
            day_before_yesterdays_sales,
            from_day_before_yesterday_pre_seven_days_avg_sales,
            //Cost or Spend
            yesterdays_cost,
            day_before_yesterdays_cost,
            from_day_before_yesterday_pre_seven_days_avg_cost,
            //Orders
            yesterdays_orders,
            day_before_yesterdays_orders,
            from_day_before_yesterday_pre_seven_days_avg_orders,
            //Clicks
            yesterdays_clicks,
            day_before_yesterdays_clicks,
            from_day_before_yesterday_pre_seven_days_avg_clicks,
            //Impressions
            yesterdays_impressions,
            day_before_yesterdays_impressions,
            from_day_before_yesterday_pre_seven_days_avg_impressions
        } = data[0];
        //Sales
        const sales_flow = calculateChange(yesterdays_sales - day_before_yesterdays_sales);
        const sales_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_sales, yesterdays_sales);
        //Cost or Spend
        const cost_flow = calculateChange(yesterdays_cost - day_before_yesterdays_cost);
        const cost_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_cost, yesterdays_cost);
        //ACOS
        const yesterdays_acos = (divTwoNum(yesterdays_cost, yesterdays_sales) * 100);
        const day_before_yesterdays_acos = divTwoNum(day_before_yesterdays_cost, day_before_yesterdays_sales) * 100;
        const from_day_before_yesterday_pre_seven_days_avg_acos = divTwoNum(from_day_before_yesterday_pre_seven_days_avg_cost, from_day_before_yesterday_pre_seven_days_avg_sales) * 100;
        const acos_flow = calculateChange(yesterdays_acos - day_before_yesterdays_acos);
        const acos_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_acos, yesterdays_acos);
        //Orders
        const orders_flow = calculateChange(yesterdays_orders - day_before_yesterdays_orders);
        const orders_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_orders, yesterdays_orders);
        //Clicks
        const clicks_flow = calculateChange(yesterdays_clicks - day_before_yesterdays_clicks);
        const clicks_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_clicks, yesterdays_clicks);
        //CPC
        const yesterdays_cpc = divTwoNum(yesterdays_cost, yesterdays_clicks);
        const day_before_yesterdays_cpc = divTwoNum(day_before_yesterdays_cost, day_before_yesterdays_clicks);
        const from_day_before_yesterday_pre_seven_days_avg_cpc = divTwoNum(from_day_before_yesterday_pre_seven_days_avg_cost, from_day_before_yesterday_pre_seven_days_avg_clicks);
        const cpc_flow = calculateChange(yesterdays_cpc - day_before_yesterdays_cpc);
        const cpc_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_cpc, yesterdays_cpc);
        //Impressions
        const impressions_flow = calculateChange(yesterdays_impressions, day_before_yesterdays_impressions);
        const impressions_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_impressions, yesterdays_impressions);
        //CTR
        const yesterdays_ctr = divTwoNum(yesterdays_clicks, yesterdays_impressions) * 100;
        const day_before_yesterdays_ctr = divTwoNum(day_before_yesterdays_clicks, day_before_yesterdays_impressions) * 100;
        const from_day_before_yesterday_pre_seven_days_avg_ctr = divTwoNum(from_day_before_yesterday_pre_seven_days_avg_clicks, from_day_before_yesterday_pre_seven_days_avg_impressions) * 100;
        const ctr_flow = calculateChange(yesterdays_ctr - day_before_yesterdays_ctr);
        const ctr_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_ctr, yesterdays_ctr);

        const tile_array = [
            {
                name: "sales",
                yesterdays: roundOffToTwoDecimal(yesterdays_sales),
                flow: sales_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_sales),
                percentage_change: roundOffToTwoDecimal(sales_percentage_change)
            },
            {
                name: "cost",
                yesterdays: roundOffToTwoDecimal(yesterdays_cost),
                flow: cost_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_cost),
                percentage_change: roundOffToTwoDecimal(cost_percentage_change)
            },
            {
                name: "acos",
                yesterdays: roundOffToTwoDecimal(yesterdays_acos),
                flow: acos_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_acos),
                percentage_change: roundOffToTwoDecimal(acos_percentage_change)
            },
            {
                name: "orders",
                yesterdays: roundOffToTwoDecimal(yesterdays_orders),
                flow: orders_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_orders),
                percentage_change: roundOffToTwoDecimal(orders_percentage_change)
            },
            {
                name: "clicks",
                yesterdays: roundOffToTwoDecimal(yesterdays_clicks),
                flow: clicks_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_clicks),
                percentage_change: roundOffToTwoDecimal(clicks_percentage_change)
            },
            {
                name: "cpc",
                yesterdays: roundOffToTwoDecimal(yesterdays_cpc),
                flow: cpc_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_cpc),
                percentage_change: roundOffToTwoDecimal(cpc_percentage_change)
            },
            {
                name: "impressions",
                yesterdays: roundOffToTwoDecimal(yesterdays_impressions),
                flow: impressions_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_impressions),
                percentage_change: roundOffToTwoDecimal(impressions_percentage_change)
            },
            {
                name: "ctr",
                yesterdays: roundOffToTwoDecimal(yesterdays_ctr),
                flow: ctr_flow,
                from_day_before_yesterday_pre_seven_days_avg: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_ctr),
                percentage_change: roundOffToTwoDecimal(ctr_percentage_change)
            }
        ]
        res.status(200).json({
            status: "success",
            data: {
                tile_array,
            }
        });
    } catch (error) {
        console.log(error);
    }

}

//Graph
exports.getGraphData = async (req, res, next) => {
    const { start_date, end_date, campaign_type_array, graph_data_type } = req.body;
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {
        let graph_data_array = [];
        if (graph_data_type === "daily") {
            const data = await CampaignReportModel.aggregate([
                {
                    $match: {
                        time_stamp: { $gte: startDate, $lte: endDate },
                        campaign_type: { $in: campaign_type_array }
                    }

                },
                {
                    $group: {
                        _id: "$time_stamp",
                        sales: { $sum: "$attributed_sales_14_d" },
                        cost: { $sum: "$cost" },
                        orders: { $sum: "$attributed_units_ordered_14_d" },
                        clicks: { $sum: "$clicks" },
                        impressions: { $sum: "$impressions" }
                    }
                },
                {
                    $project: {
                        time_stamp: "$_id",
                        sales: "$sales",
                        cost: "$cost",
                        acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$sales", 0] }, then: { $divide: ["$cost", "$sales"] }, else: 0 } }, 100] }, 2] },
                        orders: "$orders",
                        clicks: "$clicks",
                        cpc: { $round: [{ $cond: { if: { $ne: ["$clicks", 0] }, then: { $divide: ["$cost", "$clicks"] }, else: 0 } }, 2] },
                        impressions: { $sum: "$impressions" },
                        ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$impressions", 0] }, then: { $divide: ["$clicks", "$impressions"] }, else: 0 } }, 100] }, 2] }
                    }
                },
                {
                    $unset: ["_id"]
                },
                {
                    $sort: { "time_stamp": 1 }
                }
            ]);
            graph_data_array = data;
        } else if (graph_data_type === "weekly") {
            const data = await CampaignReportModel.aggregate([
                {
                    $match: {
                        time_stamp: { $gte: startDate, $lte: endDate },
                        campaign_type: { $in: campaign_type_array }
                    }

                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$time_stamp" },
                            year: { $year: "$time_stamp" }
                        },
                        //Sales
                        week_one_sales: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 1] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 7] }] }, then: "$attributed_sales_14_d", else: 0 } } },
                        week_two_sales: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 8] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 14] }] }, then: "$attributed_sales_14_d", else: 0 } } },
                        week_three_sales: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 15] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 21] }] }, then: "$attributed_sales_14_d", else: 0 } } },
                        week_four_sales: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 22] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 28] }] }, then: "$attributed_sales_14_d", else: 0 } } },
                        week_five_sales: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 29] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 31] }] }, then: "$attributed_sales_14_d", else: 0 } } },
                        //Cost
                        week_one_cost: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 1] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 7] }] }, then: "$cost", else: 0 } } },
                        week_two_cost: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 8] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 14] }] }, then: "$cost", else: 0 } } },
                        week_three_cost: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 15] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 21] }] }, then: "$cost", else: 0 } } },
                        week_four_cost: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 22] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 28] }] }, then: "$cost", else: 0 } } },
                        week_five_cost: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 29] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 31] }] }, then: "$cost", else: 0 } } },
                        //Orders
                        week_one_orders: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 1] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 7] }] }, then: "$attributed_units_ordered_14_d", else: 0 } } },
                        week_two_orders: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 8] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 14] }] }, then: "$attributed_units_ordered_14_d", else: 0 } } },
                        week_three_orders: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 15] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 21] }] }, then: "$attributed_units_ordered_14_d", else: 0 } } },
                        week_four_orders: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 22] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 28] }] }, then: "$attributed_units_ordered_14_d", else: 0 } } },
                        week_five_orders: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 29] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 31] }] }, then: "$attributed_units_ordered_14_d", else: 0 } } },
                        //Clicks
                        week_one_clicks: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 1] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 7] }] }, then: "$clicks", else: 0 } } },
                        week_two_clicks: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 8] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 14] }] }, then: "$clicks", else: 0 } } },
                        week_three_clicks: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 15] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 21] }] }, then: "$clicks", else: 0 } } },
                        week_four_clicks: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 22] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 28] }] }, then: "$clicks", else: 0 } } },
                        week_five_clicks: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 29] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 31] }] }, then: "$clicks", else: 0 } } },
                        //Impressions
                        week_one_impressions: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 1] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 7] }] }, then: "$impressions", else: 0 } } },
                        week_two_impressions: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 8] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 14] }] }, then: "$impressions", else: 0 } } },
                        week_three_impressions: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 15] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 21] }] }, then: "$impressions", else: 0 } } },
                        week_four_impressions: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 22] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 28] }] }, then: "$impressions", else: 0 } } },
                        week_five_impressions: { $sum: { $cond: { if: { $and: [{ $gte: [{ $dayOfMonth: "$time_stamp" }, 29] }, { $lte: [{ $dayOfMonth: "$time_stamp" }, 31] }] }, then: "$impressions", else: 0 } } },
                    }
                },
                {
                    $project: {
                        time_stamp: "$_id",
                        //Sales
                        week_one_sales: "$week_one_sales",
                        week_two_sales: "$week_two_sales",
                        week_three_sales: "$week_three_sales",
                        week_four_sales: "$week_four_sales",
                        week_five_sales: "$week_five_sales",
                        //Cost
                        week_one_cost: "$week_one_cost",
                        week_two_cost: "$week_two_cost",
                        week_three_cost: "$week_three_cost",
                        week_four_cost: "$week_four_cost",
                        week_five_cost: "$week_five_cost",
                        //ACOS
                        //   { $cond: { if: { $ne: ["$week_one_sales", 0] }, then:  { $divide: ["$week_one_cost", "$week_one_sales"] }  , else: 0 } }
                        week_one_acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_one_sales", 0] }, then: { $divide: ["$week_one_cost", "$week_one_sales"] }, else: 0 } }, 100] }, 2] },
                        week_two_acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_two_sales", 0] }, then: { $divide: ["$week_two_cost", "$week_two_sales"] }, else: 0 } }, 100] }, 2] },
                        week_three_acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_three_sales", 0] }, then: { $divide: ["$week_three_cost", "$week_three_sales"] }, else: 0 } }, 100] }, 2] },
                        week_four_acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_four_sales", 0] }, then: { $divide: ["$week_four_cost", "$week_four_sales"] }, else: 0 } }, 100] }, 2] },
                        week_five_acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_five_sales", 0] }, then: { $divide: ["$week_five_cost", "$week_five_sales"] }, else: 0 } }, 100] }, 2] },
                        //Orders
                        week_one_orders: "$week_one_orders",
                        week_two_orders: "$week_two_orders",
                        week_three_orders: "$week_three_orders",
                        week_four_orders: "$week_four_orders",
                        week_five_orders: "$week_five_orders",
                        //Clicks
                        week_one_clicks: "$week_one_clicks",
                        week_two_clicks: "$week_two_clicks",
                        week_three_clicks: "$week_three_clicks",
                        week_four_clicks: "$week_four_clicks",
                        week_five_clicks: "$week_five_clicks",
                        //CPC
                        week_one_cpc: { $round: [{ $cond: { if: { $ne: ["$week_one_clicks", 0] }, then: { $divide: ["$week_one_cost", "$week_one_clicks"] }, else: 0 } }, 2] },
                        week_two_cpc: { $round: [{ $cond: { if: { $ne: ["$week_two_clicks", 0] }, then: { $divide: ["$week_two_cost", "$week_two_clicks"] }, else: 0 } }, 2] },
                        week_three_cpc: { $round: [{ $cond: { if: { $ne: ["$week_three_clicks", 0] }, then: { $divide: ["$week_three_cost", "$week_three_clicks"] }, else: 0 } }, 2] },
                        week_four_cpc: { $round: [{ $cond: { if: { $ne: ["$week_four_clicks", 0] }, then: { $divide: ["$week_four_cost", "$week_four_clicks"] }, else: 0 } }, 2] },
                        week_five_cpc: { $round: [{ $cond: { if: { $ne: ["$week_five_clicks", 0] }, then: { $divide: ["$week_five_cost", "$week_five_clicks"] }, else: 0 } }, 2] },

                        //Impressions
                        week_one_impressions: "$week_one_impressions",
                        week_two_impressions: "$week_two_impressions",
                        week_three_impressions: "$week_three_impressions",
                        week_four_impressions: "$week_four_impressions",
                        week_five_impressions: "$week_five_impressions",
                        //CTR
                        week_one_ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_one_impressions", 0] }, then: { $divide: ["$week_one_clicks", "$week_one_impressions"] }, else: 0 } }, 100] }, 2] },
                        week_two_ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_two_impressions", 0] }, then: { $divide: ["$week_two_clicks", "$week_two_impressions"] }, else: 0 } }, 100] }, 2] },
                        week_three_ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_three_impressions", 0] }, then: { $divide: ["$week_three_clicks", "$week_three_impressions"] }, else: 0 } }, 100] }, 2] },
                        week_four_ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_four_impressions", 0] }, then: { $divide: ["$week_four_clicks", "$week_four_impressions"] }, else: 0 } }, 100] }, 2] },
                        week_five_ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$week_five_impressions", 0] }, then: { $divide: ["$week_five_clicks", "$week_five_impressions"] }, else: 0 } }, 100] }, 2] },
                    }
                },
                {
                    $unset: ["_id"]
                },
                {
                    $sort: { "time_stamp.year": 1, "time_stamp.month": 1 }
                }
            ]);

            const graph_data_array_internal = [];
            if (data.length > 0) {
                data.forEach(monthObj => {
                    const {
                        time_stamp,
                        //Sales
                        week_one_sales, week_two_sales, week_three_sales, week_four_sales, week_five_sales,
                        //Cost
                        week_one_cost, week_two_cost, week_three_cost, week_four_cost, week_five_cost,
                        //ACOS
                        week_one_acos, week_two_acos, week_three_acos, week_four_acos, week_five_acos,
                        //Orders
                        week_one_orders, week_two_orders, week_three_orders, week_four_orders, week_five_orders,
                        //Clicks
                        week_one_clicks, week_two_clicks, week_three_clicks, week_four_clicks, week_five_clicks,
                        //CPC
                        week_one_cpc, week_two_cpc, week_three_cpc, week_four_cpc, week_five_cpc,
                        //Impressions
                        week_one_impressions, week_two_impressions, week_three_impressions, week_four_impressions, week_five_impressions,
                        //CTR
                        week_one_ctr, week_two_ctr, week_three_ctr, week_four_ctr, week_five_ctr,
                    } = monthObj;
                    const monthInText = getMontheInText(time_stamp.month);
                    const weekArray = [
                        {
                            time_stamp: `${monthInText}-week 1`,
                            sales: week_one_sales,
                            cost: week_one_cost,
                            acos: week_one_acos,
                            orders: week_one_orders,
                            clicks: week_one_clicks,
                            cpc: week_one_cpc,
                            impressions: week_one_impressions,
                            ctr: week_one_ctr
                        },
                        {
                            time_stamp: `${monthInText}-week 2`,
                            sales: week_two_sales,
                            cost: week_two_cost,
                            acos: week_two_acos,
                            orders: week_two_orders,
                            clicks: week_two_clicks,
                            cpc: week_two_cpc,
                            impressions: week_two_impressions,
                            ctr: week_two_ctr
                        },
                        {
                            time_stamp: `${monthInText}-week 3`,
                            sales: week_three_sales,
                            cost: week_three_cost,
                            acos: week_three_acos,
                            orders: week_three_orders,
                            clicks: week_three_clicks,
                            cpc: week_three_cpc,
                            impressions: week_three_impressions,
                            ctr: week_three_ctr
                        },
                        {
                            time_stamp: `${monthInText}-week 4`,
                            sales: week_four_sales,
                            cost: week_four_cost,
                            acos: week_four_acos,
                            orders: week_four_orders,
                            clicks: week_four_clicks,
                            cpc: week_four_cpc,
                            impressions: week_four_impressions,
                            ctr: week_four_ctr
                        }
                    ]

                    const daysInMonth = new Date(time_stamp.year, time_stamp.month, 0).getDate();
                    if (daysInMonth > 28) {
                        weekArray.push({
                            time_stamp: `${monthInText}-week 5`,
                            sales: week_five_sales,
                            cost: week_five_cost,
                            acos: week_five_acos,
                            orders: week_five_orders,
                            clicks: week_five_clicks,
                            cpc: week_five_cpc,
                            impressions: week_five_impressions,
                            ctr: week_five_ctr
                        })
                    }
                    graph_data_array_internal.push(...weekArray)

                });
            }


            graph_data_array = graph_data_array_internal;
        } else if (graph_data_type === "monthly") {
            const data = await CampaignReportModel.aggregate([
                {
                    $match: {
                        time_stamp: { $gte: startDate, $lte: endDate },
                        campaign_type: { $in: campaign_type_array }
                    }

                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$time_stamp" },
                            year: { $year: "$time_stamp" }
                        },
                        sales: { $sum: "$attributed_sales_14_d" },
                        cost: { $sum: "$cost" },
                        orders: { $sum: "$attributed_units_ordered_14_d" },
                        clicks: { $sum: "$clicks" },
                        impressions: { $sum: "$impressions" }
                    }
                },
                {
                    $project: {
                        time_stamp: "$_id",
                        sales: "$sales",
                        cost: "$cost",
                        acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$sales", 0] }, then: { $divide: ["$cost", "$sales"] }, else: 0 } }, 100] }, 2] },
                        orders: "$orders",
                        clicks: "$clicks",
                        cpc: { $round: [{ $cond: { if: { $ne: ["$clicks", 0] }, then: { $divide: ["$cost", "$clicks"] }, else: 0 } }, 2] },
                        impressions: { $sum: "$impressions" },
                        ctr: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$impressions", 0] }, then: { $divide: ["$clicks", "$impressions"] }, else: 0 } }, 100] }, 2] }
                    }
                },
                {
                    $unset: ["_id"]
                },
                {
                    $sort: { "time_stamp.year": 1, "time_stamp.month": 1 }
                }
            ]);

            data.forEach(monthObj => {
                const { time_stamp } = monthObj
                const { month, year } = time_stamp;
                const monthInText = getMontheInText(month);
                monthObj.time_stamp = `${monthInText}-${year}`;
            })
            graph_data_array = data;
        }

        res.status(200).json({
            status: "success",
            data: {
                graph_data_array,
                graph_data_type
            }
        })

    } catch (error) {
        console.log(error);
    }



}


exports.getDashboardData = async (req, res, next) => {
    try {
        const data = await DashboardDataModel.find();
        res.status(200).json({
            status: "success",
            data: {
                data
            }
        })
    } catch (error) {
        console.log(error);
    }
}

exports.getCategoryTableData = async (req, res, next) => {
    const { time_stamp, campaign_type_array, category_array } = req.body;
    const yesterday = new Date(time_stamp);
    const dayBeforeYesterday = new Date(time_stamp);
    const preEightDayFromYesterday = new Date(time_stamp);
    yesterday.setDate(yesterday.getDate() - 1);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    preEightDayFromYesterday.setDate(preEightDayFromYesterday.getDate() - 8);

    try {
        const data = await CampaignReportModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: preEightDayFromYesterday, $lte: yesterday },
                    campaign_type: { $in: campaign_type_array },
                    category: { $in: category_array }
                }
            },
            {
                $group: {
                    _id: "$category",
                    //Sales
                    yesterdays_sales: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    },
                    day_before_yesterdays_sales: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_sales: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    },
                    //cost or spend
                    yesterdays_cost: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$cost", else: 0 } }
                    },
                    day_before_yesterdays_cost: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$cost", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_cost: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$cost", else: 0 } }
                    },
                    //Orders
                    yesterdays_orders: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$attributed_units_ordered_14_d", else: 0 } }
                    },
                    day_before_yesterdays_orders: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$attributed_units_ordered_14_d", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_orders: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$attributed_units_ordered_14_d", else: 0 } }
                    },
                    //Clicks
                    yesterdays_clicks: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$clicks", else: 0 } }
                    },
                    day_before_yesterdays_clicks: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$clicks", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_clicks: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$clicks", else: 0 } }
                    },
                    //Impressions
                    yesterdays_impressions: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$impressions", else: 0 } }
                    },
                    day_before_yesterdays_impressions: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", dayBeforeYesterday] }, then: "$impressions", else: 0 } }
                    },
                    from_day_before_yesterday_pre_seven_days_impressions: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$impressions", else: 0 } }
                    },
                }
            },
            {
                $project: {
                    category: "$_id",
                    //sales
                    yesterdays_sales: "$yesterdays_sales",
                    day_before_yesterdays_sales: "$day_before_yesterdays_sales",
                    from_day_before_yesterday_pre_seven_days_avg_sales: { $divide: ["$from_day_before_yesterday_pre_seven_days_sales", 7] },
                    //sales
                    yesterdays_cost: "$yesterdays_cost",
                    day_before_yesterdays_cost: "$day_before_yesterdays_cost",
                    from_day_before_yesterday_pre_seven_days_avg_cost: { $divide: ["$from_day_before_yesterday_pre_seven_days_cost", 7] },
                    //Orders
                    yesterdays_orders: "$yesterdays_orders",
                    day_before_yesterdays_orders: "$day_before_yesterdays_orders",
                    from_day_before_yesterday_pre_seven_days_avg_orders: { $divide: ["$from_day_before_yesterday_pre_seven_days_orders", 7] },
                    //Clicks
                    yesterdays_clicks: "$yesterdays_clicks",
                    day_before_yesterdays_clicks: "$day_before_yesterdays_clicks",
                    from_day_before_yesterday_pre_seven_days_avg_clicks: { $divide: ["$from_day_before_yesterday_pre_seven_days_clicks", 7] },

                    //Impressions
                    yesterdays_impressions: "$yesterdays_impressions",
                    day_before_yesterdays_impressions: "$day_before_yesterdays_impressions",
                    from_day_before_yesterday_pre_seven_days_avg_impressions: { $divide: ["$from_day_before_yesterday_pre_seven_days_impressions", 7] },


                }
            },
            {
                $unset: ["_id"]
            },
            {
                $sort: { "category": 1 }
            }
        ])


        const category_table_data_array = data.map(obj => {
            const {
                category,
                //Sales
                yesterdays_sales,
                day_before_yesterdays_sales,
                from_day_before_yesterday_pre_seven_days_avg_sales,
                //Cost or Spend
                yesterdays_cost,
                day_before_yesterdays_cost,
                from_day_before_yesterday_pre_seven_days_avg_cost,
                //Orders
                yesterdays_orders,
                day_before_yesterdays_orders,
                from_day_before_yesterday_pre_seven_days_avg_orders,
                //Clicks
                yesterdays_clicks,
                day_before_yesterdays_clicks,
                from_day_before_yesterday_pre_seven_days_avg_clicks,
                //Impressions
                yesterdays_impressions,
                day_before_yesterdays_impressions,
                from_day_before_yesterday_pre_seven_days_avg_impressions
            } = obj;
            //Sales
            const sales_flow = calculateChange(yesterdays_sales - day_before_yesterdays_sales);
            const sales_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_sales, yesterdays_sales);
            //Cost or Spend
            const cost_flow = calculateNegativeOfChange(yesterdays_cost - day_before_yesterdays_cost);
            const cost_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_cost, yesterdays_cost);
            //ACOS
            const yesterdays_acos = (divTwoNum(yesterdays_cost, yesterdays_sales) * 100);
            const day_before_yesterdays_acos = divTwoNum(day_before_yesterdays_cost, day_before_yesterdays_sales) * 100;
            const from_day_before_yesterday_pre_seven_days_avg_acos = divTwoNum(from_day_before_yesterday_pre_seven_days_avg_cost, from_day_before_yesterday_pre_seven_days_avg_sales) * 100;
            const acos_flow = calculateNegativeOfChange(yesterdays_acos - day_before_yesterdays_acos);
            const acos_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_acos, yesterdays_acos);
            //Orders
            const orders_flow = calculateChange(yesterdays_orders - day_before_yesterdays_orders);
            const orders_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_orders, yesterdays_orders);
            //Clicks
            const clicks_flow = calculateChange(yesterdays_clicks - day_before_yesterdays_clicks);
            const clicks_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_clicks, yesterdays_clicks);
            //CPC
            const yesterdays_cpc = divTwoNum(yesterdays_cost, yesterdays_clicks);
            const day_before_yesterdays_cpc = divTwoNum(day_before_yesterdays_cost, day_before_yesterdays_clicks);
            const from_day_before_yesterday_pre_seven_days_avg_cpc = divTwoNum(from_day_before_yesterday_pre_seven_days_avg_cost, from_day_before_yesterday_pre_seven_days_avg_clicks);
            const cpc_flow = calculateNegativeOfChange(yesterdays_cpc - day_before_yesterdays_cpc);
            const cpc_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_cpc, yesterdays_cpc);
            //Impressions
            const impressions_flow = calculateChange(yesterdays_impressions, day_before_yesterdays_impressions);
            const impressions_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_impressions, yesterdays_impressions);
            //CTR
            const yesterdays_ctr = divTwoNum(yesterdays_clicks, yesterdays_impressions) * 100;
            const day_before_yesterdays_ctr = divTwoNum(day_before_yesterdays_clicks, day_before_yesterdays_impressions) * 100;
            const from_day_before_yesterday_pre_seven_days_avg_ctr = divTwoNum(from_day_before_yesterday_pre_seven_days_avg_clicks, from_day_before_yesterday_pre_seven_days_avg_impressions) * 100;
            const ctr_flow = calculateChange(yesterdays_ctr - day_before_yesterdays_ctr);
            const ctr_percentage_change = calculatePercentageChange(from_day_before_yesterday_pre_seven_days_avg_ctr, yesterdays_ctr);

            return {
                category,

                yesterdays_sales: roundOffToTwoDecimal(yesterdays_sales),
                sales_flow: sales_flow,
                from_day_before_yesterday_pre_seven_days_avg_sales: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_sales),
                sales_percentage_change: roundOffToTwoDecimal(sales_percentage_change),

                yesterdays_cost: roundOffToTwoDecimal(yesterdays_cost),
                cost_flow: cost_flow,
                from_day_before_yesterday_pre_seven_days_avg_cost: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_cost),
                cost_percentage_change: roundOffToTwoDecimal(cost_percentage_change),

                yesterdays_acos: roundOffToTwoDecimal(yesterdays_acos),
                acos_flow: acos_flow,
                from_day_before_yesterday_pre_seven_days_avg_acos: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_acos),
                acos_percentage_change: roundOffToTwoDecimal(acos_percentage_change),

                yesterdays_orders: roundOffToTwoDecimal(yesterdays_orders),
                orders_flow: orders_flow,
                from_day_before_yesterday_pre_seven_days_avg_orders: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_orders),
                orders_percentage_change: roundOffToTwoDecimal(orders_percentage_change),

                yesterdays_clicks: roundOffToTwoDecimal(yesterdays_clicks),
                clicks_flow: clicks_flow,
                from_day_before_yesterday_pre_seven_days_avg_clicks: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_clicks),
                clicks_percentage_change: roundOffToTwoDecimal(clicks_percentage_change),

                yesterdays_impressions: roundOffToTwoDecimal(yesterdays_impressions),
                impressions_flow: impressions_flow,
                from_day_before_yesterday_pre_seven_days_avg_impressions: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_impressions),
                impressions_percentage_change: roundOffToTwoDecimal(impressions_percentage_change),

                yesterdays_cpc: roundOffToTwoDecimal(yesterdays_cpc),
                cpc_flow: cpc_flow,
                from_day_before_yesterday_pre_seven_days_avg_cpc: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_cpc),
                cpc_percentage_change: roundOffToTwoDecimal(cpc_percentage_change),

                yesterdays_ctr: roundOffToTwoDecimal(yesterdays_ctr),
                ctr_flow: ctr_flow,
                from_day_before_yesterday_pre_seven_days_avg_ctr: roundOffToTwoDecimal(from_day_before_yesterday_pre_seven_days_avg_ctr),
                ctr_percentage_change: roundOffToTwoDecimal(ctr_percentage_change)

            }
        })


        res.status(200).json({
            status: "success",
            data: {
                category_table_data_array
            }
        })
    } catch (error) {
        console.log(error)
    }


}
const categoryWiseTarget = [
    { category: "Instant Coffee", ad_sales: 675036, cost: 289557, time_stamp: "" },
    { category: "Hampers & Gourmet Gifts", ad_sales: 315324, cost: 99756, time_stamp: "" },
    { category: "Cold Brew", ad_sales: 293266, cost: 184387, time_stamp: "" },
    { category: "Hot Brew", ad_sales: 242807, cost: 116309, time_stamp: "" },
    { category: "Ground Coffee", ad_sales: 131879, cost: 84690, time_stamp: "" },
    { category: "Coffee Maker", ad_sales: 52503, cost: 57097, time_stamp: "" },
    { category: "Filter coffee", ad_sales: 17551, cost: 6912, time_stamp: "" },
    { category: "Roasted coffee beans", ad_sales: 13951, cost: 9305, time_stamp: "" },
    { category: "Cold Coffee", ad_sales: 11436, cost: 10607, time_stamp: "" },
]

exports.getTargetsTableData = async (req, res, next) => {
    const { time_stamp, campaign_type_array, category_array } = req.body;
    const { yesterday, firstDayOfMonth } = getYesterdayAndFirstDayOfMonth(time_stamp);
    try {
        const data = await CampaignReportModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: firstDayOfMonth, $lte: yesterday },
                    campaign_type: { $in: campaign_type_array },
                    category: { $in: category_array }
                }
            },
            {
                $group: {
                    _id: "$category",
                    //Sales
                    sales: {
                        $sum: "$attributed_sales_14_d"
                    },
                    //cost or spend
                    cost: {
                        $sum: "$cost"
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    category: "$_id",
                    sales: { $round: ["$sales", 2] },
                    cost: { $round: ["$cost", 2] },
                    acos: { $round: [{ $multiply: [{ $cond: { if: { $ne: ["$sales", 0] }, then: { $divide: ["$cost", "$sales"] }, else: 0 } }, 100] }, 2] }

                }
            },
            {
                $unset: ["_id"]
            },
            {
                $sort: { "category": 1 }
            }
        ]);
        const divNum = getDaysInMonth(yesterday);
        const MultiplyNum = new Date(yesterday).getDate();
        const targets_table_data_array = data.map(obj => {
            const { category, sales, cost, acos } = obj;

            const [masterCategoryWiseTarget] = categoryWiseTarget.filter(mObj => mObj.category === category);

            const target_sales = roundOffToTwoDecimal(divTwoNum(masterCategoryWiseTarget.ad_sales, divNum) * MultiplyNum);
            const target_cost = roundOffToTwoDecimal(divTwoNum(masterCategoryWiseTarget.cost, divNum) * MultiplyNum);
            const target_acos = roundOffToTwoDecimal(divTwoNum(target_cost, target_sales) * 100);

            const salesDiff = sales - target_sales;
            const costDiff = cost - target_cost;
            const acosDiff = acos - target_acos;
            const sales_flow = calculateChange(salesDiff);
            const cost_flow = calculateNegativeOfChange(costDiff);
            const acos_flow = calculateNegativeOfChange(acosDiff);
            return {
                category,
                sales,
                target_sales,
                sales_flow,
                cost,
                target_cost,
                cost_flow,
                acos,
                target_acos,
                acos_flow
            }
        })

        res.status(200).json({
            status: "success",
            data: {
                targets_table_data_array
            }
        })
    } catch (error) {
        console.log(error)
    }


}

exports.getRemainingTargetsTileData = async (req, res, next) => {
    const { time_stamp, campaign_type_array, category_array } = req.body;
    const { yesterday, firstDayOfMonth } = getYesterdayAndFirstDayOfMonth(time_stamp);
    const dayBeforeYesterday = new Date(time_stamp);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    try {
        const data = await CampaignReportModel.aggregate([
            {
                $match: {
                    time_stamp: { $gte: firstDayOfMonth, $lte: yesterday },
                    campaign_type: { $in: campaign_type_array },
                    category: { $in: category_array }
                }
            },
            {
                $group: {
                    _id: "$category",
                    //Sales
                    total_sales: {
                        $sum: { $cond: { if: { $ne: ["$time_stamp", yesterday] }, then: "$attributed_sales_14_d", else: 0 } }

                    },
                    yesterdays_sales: {
                        $sum: { $cond: { if: { $eq: ["$time_stamp", yesterday] }, then: "$attributed_sales_14_d", else: 0 } }
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    category: "$_id",
                    total_sales: { $round: ["$total_sales", 2] },
                    yesterdays_sales: { $round: ["$yesterdays_sales", 2] }
                }
            },
            {
                $unset: ["_id"]
            },
            {
                $sort: { "category": 1 }
            }
        ]);
        let yesterdays_targets_data_array;
        const totalDays = getDaysInMonth(yesterday);
        if (yesterday.getDate() === 1) {
            yesterdays_targets_data_array = data.map(obj => {
                const { category, yesterdays_sales } = obj;
                const [masterCategoryWiseTarget] = categoryWiseTarget.filter(mObj => mObj.category === category);
                const yesterdays_target_sales = roundOffToTwoDecimal(divTwoNum(masterCategoryWiseTarget.ad_sales, totalDays));
                const salesDiff = yesterdays_sales - yesterdays_target_sales;
                const yesterdays_sales_flow = calculateChange(salesDiff);
                const sales_diff_percentage = roundOffToTwoDecimal(calculatePercentageChange(yesterdays_target_sales, yesterdays_sales))
                return {
                    category,
                    yesterdays_sales,
                    yesterdays_target_sales,
                    yesterdays_sales_flow,
                    sales_diff_percentage
                }
            })
        } else {
            const passedDays = dayBeforeYesterday.getDate();
            const remainingDays = totalDays - passedDays;
            yesterdays_targets_data_array = data.map(obj => {
                const { category, yesterdays_sales, total_sales } = obj;
                const [masterCategoryWiseTarget] = categoryWiseTarget.filter(mObj => mObj.category === category);
                const remainingTargetSales = masterCategoryWiseTarget.ad_sales - total_sales;//What if remaining target sales is negative
                const yesterdays_target_sales = roundOffToTwoDecimal(divTwoNum(remainingTargetSales, remainingDays));
                const salesDiff = yesterdays_sales - yesterdays_target_sales;
                const yesterdays_sales_flow = calculateChange(salesDiff);

                const sales_diff_percentage = roundOffToTwoDecimal(calculatePercentageChange(yesterdays_target_sales, yesterdays_sales))
                return {
                    category,
                    yesterdays_sales,
                    yesterdays_target_sales,
                    yesterdays_sales_flow,
                    sales_diff_percentage
                }
            })
        }

        res.status(200).json({
            status: "success",
            data: {
                yesterdays_targets_data_array

            }
        })
    } catch (error) {
        console.log(error)
    }
}
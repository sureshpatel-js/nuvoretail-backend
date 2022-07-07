const Visibility = require('../model/visibilityModel')

exports.getVisibility = async (req, res, next) => {
    try {
        console.log(req.body);
        const { placement, start_date, end_date, hr_stamp, keywords } = req.body;
        const brand_v_comp = await Visibility.aggregate([
            {
                $match: {
                    $and: [{
                        date_stamp: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date)
                        }
                    },
                    {
                        placement_group: { $in: placement }
                    },
                    {
                        time_stamp: hr_stamp
                    },
                    {
                        keyword: { $in: keywords }
                    }

                    ]
                },
            },
            {
                $group: {
                    _id: "$date_stamp",
                    comp_count: { $sum: { $cond: { "if": { "$eq": ["$brand_comp", "Competitor"] }, then: 1, else: 0 }, }, },
                    total_count: { $sum: 1 },
                },

            },
            {
                $project: {
                    comp_brand: { $multiply: [{ $divide: ['$comp_count', "$total_count"] }, 100] },
                },
            },
            { $sort: { _id: 1 }, },
            { $unset: ["comp_count", "total_count"] },

        ]);

        const first_slot = await Visibility.aggregate([
            {
                $match: {
                    $and: [{
                        date_stamp: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date)
                        }
                    },
                    {
                        placement_group: { $in: placement }
                    },
                    {
                        time_stamp: hr_stamp
                    },
                    {
                        keyword: { $in: keywords }
                    }

                    ]
                },
            },
            {
                $group: {
                    _id: "$date_stamp",
                    sb_first_count: { $sum: { $cond: { "if": { $and: [{ "$eq": ["$placement", "SB1"] }, { "$ne": ["$brand_comp", "Competitor"] },] }, then: 1, else: 0 }, }, },
                    total_sb_first_count: { $sum: { $cond: { "if": { "$eq": ["$placement", "SB1"] }, then: 1, else: 0 }, }, },
                    sp_first_count: { $sum: { $cond: { "if": { $and: [{ "$eq": ["$placement", "SP1"] }, { "$ne": ["$brand_comp", "Competitor"] },] }, then: 1, else: 0 }, }, },
                    total_sp_first_count: { $sum: { $cond: { "if": { "$eq": ["$placement", "SP1"] }, then: 1, else: 0 }, }, },
                    og_first_count: { $sum: { $cond: { "if": { $and: [{ "$eq": ["$placement", "OG1"] }, { "$ne": ["$brand_comp", "Competitor"] },] }, then: 1, else: 0 }, }, },
                    total_og_first_count: { $sum: { $cond: { "if": { "$eq": ["$placement", "OG1"] }, then: 1, else: 0 }, }, },
                    sv_first_count: { $sum: { $cond: { "if": { $and: [{ "$eq": ["$placement", "SV"] }, { "$ne": ["$brand_comp", "Competitor"] },] }, then: 1, else: 0 }, }, },
                    total_sv_first_count: { $sum: { $cond: { "if": { "$eq": ["$placement", "SV"] }, then: 1, else: 0 }, }, },
                },
            },

            {
                $project: {
                    sb_first_percentage: { $cond: { "if": { "$eq": ["$total_sb_first_count", 0] }, then: 0, else: { $multiply: [{ $divide: ['$sb_first_count', "$total_sb_first_count"] }, 100] }, }, },
                    sp_first_percentage: { $cond: { "if": { "$eq": ["$total_sp_first_count", 0] }, then: 0, else: { $multiply: [{ $divide: ['$sp_first_count', "$total_sp_first_count"] }, 100] }, }, },
                    og_first_percentage: { $cond: { "if": { "$eq": ["$total_og_first_count", 0] }, then: 0, else: { $multiply: [{ $divide: ['$og_first_count', "$total_og_first_count"] }, 100] }, }, },
                    sv_first_percentage: { $cond: { "if": { "$eq": ["$total_sv_first_count", 0] }, then: 0, else: { $multiply: [{ $divide: ['$sv_first_count', "$total_sv_first_count"] }, 100] }, }, },
                },
            },
            { $sort: { _id: 1 }, },
            {
                $unset: ["sb_first_count", "sp_first_count", "og_first_count", "sv_first_count", "total_sb_first_count", "total_sp_first_count", "total_og_first_count", "total_sv_first_count"]
            },
        ]);

        res.status(200).json({
            status: "success",
            brand_v_comp,
            first_slot

        })
    } catch (error) {
        console.log(error)
    }
}

exports.createVisibility = async (req, res, next) => {
    try {
        console.log(req.body)
        // const newVisibility = await Visibility.insertMany(req.body);
        const newVisibility = await Visibility.create(req.body);
        res.status(201).json({
            status: "success",

        })
    } catch (error) {
        console.log(error)
    }
}
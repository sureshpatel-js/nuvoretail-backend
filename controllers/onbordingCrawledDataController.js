const OnbordingCrawledDataModel = require("../models/onbordingCrawledDataModel");
const KeywordDumpModel = require("../models/keywordDumpModel");
const { validateOnbordingCrawledData,
    validateManyOnbordingCrawledData
} = require("../validate/validateOnbordingCrawledData");
const AppError = require("../utils/errorHandling/AppError");
exports.getOnbordingCrawledData = async (req, res, next) => {
    try {
        const crolledData = await OnbordingCrawledDataModel.find();
        res.status(200).json({
            status: "success",
            data: {
                crolledData
            }
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            data: {
                error
            }
        });
    }
};

exports.getSellerNames = async (req, res, next) => {
    try {
        const sellerArrary = await OnbordingCrawledDataModel.aggregate([
            {
                $group: {
                    _id: "$seller"
                }
            },
            {
                $project: {
                    seller: "$_id"
                }
            },
            {
                $unset: ["_id"]
            }
        ])
        const seller_arrary = [];
        for (let seller of sellerArrary) {
            seller_arrary.push(seller.seller);
        }
        res.status(200).json({
            status: "success",
            data: {
                seller_arrary
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "fail",
            data: {
                error
            }
        });
    }
}

exports.getKeywords = async (req, res, next) => {
    try {
        const keywordArrary = await KeywordDumpModel.aggregate([
            {
                $group: {
                    _id: "$keyword"
                }
            },
            {
                $project: {
                    keyword: "$_id"
                }
            },
            {
                $unset: ["_id"]
            }
        ])
        const keyword_arrary = [];
        for (let keyword of keywordArrary) {
            keyword_arrary.push(keyword.keyword);
        }
        res.status(200).json({
            status: "success",
            data: {
                keyword_arrary
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "fail",
            data: {
                error
            }
        });
    }
}

exports.createOnbordingCrawledData = async (req, res, next) => {
    const value = await validateOnbordingCrawledData(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    try {
        const crolledData = await OnbordingCrawledDataModel.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                crolledData
            }
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            data: {
                error
            }
        });
    }
};

exports.createManyOnbordingCrawledData = async (req, res, next) => {
    const value = await validateManyOnbordingCrawledData(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));
    }
    try {
        const { onbordingCrawledData } = req.body;
        const crolledData = await OnbordingCrawledDataModel.insertMany(onbordingCrawledData);
        res.status(201).json({
            status: "success",
            data: {
                message: "Documents insereted successfully."
            }
        });
    } catch (error) {
        return next(new AppError(400, error));

    }
};


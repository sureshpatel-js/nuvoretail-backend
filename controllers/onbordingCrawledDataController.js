const OnbordingCrawledDataModel = require("../models/onbordingCrawledDataModel");
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


const ClientMonthlyConfigModel = require("../models/clientMonthlyConfigModel");
const { validateClientMonthlyConfigStageOne, validateClientMonthlyConfigStageTwo } = require("../validate/validateClientMonthlyConfig");
const AppError = require("../utils/errorHandling/AppError");
exports.createClientMonthlyConfigStageOne = async (req, res, next) => {
    const value = await validateClientMonthlyConfigStageOne(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    try {
        const clientMonthlyConfig = await ClientMonthlyConfigModel.create(req.body);
        res.status(201).json({
            status: "success",
            clientMonthlyConfig
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            data: {
                error
            }
        });
    }
}
exports.createClientMonthlyConfigStageTwo = async (req, res, next) => {
    console.log(req.params.id)
    const value = await validateClientMonthlyConfigStageTwo(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    try {
        const clientMonthlyConfig = await ClientMonthlyConfigModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(201).json({
            status: "success",
            clientMonthlyConfig
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            data: {
                error
            }
        });
    }
}

exports.getClientMonthlyConfig = async (req, res, next) => {
    try {
        const clientMonthlyConfig = await ClientMonthlyConfigModel.findOne(req.query);
        res.status(200).json({
            status: "success",
            clientMonthlyConfig
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            data: {
                error
            }
        });
    }
}
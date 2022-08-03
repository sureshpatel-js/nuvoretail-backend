const ClientMonthlyConfigModel = require("../models/clientMonthlyConfigModel");
const { validateClientMonthlyConfig } = require("../validate/validateClientMonthlyConfig");
const AppError = require("../utils/errorHandling/AppError");
exports.createClientMonthlyConfig = async (req, res, next) => {
    const value = await validateClientMonthlyConfig(req.body, "post");
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
        return next(new AppError(400, error.message));
    }
}
exports.updateClientMonthlyConfig = async (req, res, next) => {
    const value = await validateClientMonthlyConfig(req.body, "put");
    if (!value.status) {
        return next(new AppError(400, value.message));
    }
    //while updating also inclue company id from user for more security
    try {
        const clientMonthlyConfig = await ClientMonthlyConfigModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(201).json({
            status: "success",
            data: {
                clientMonthlyConfig
            }
        });
    } catch (error) {
        return next(new AppError(400, error.message));
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
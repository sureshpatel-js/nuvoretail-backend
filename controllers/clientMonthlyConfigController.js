const ClientMonthlyConfigModel = require("../models/clientMonthlyConfigModel");
const { validateClientMonthlyConfig } = require("../validate/validateClientMonthlyConfig");
const AppError = require("../utils/errorHandling/AppError");
const ClientDetails = require("../models/clientDetails");
exports.createClientMonthlyConfig = async (req, res, next) => {
    // const value = await validateClientMonthlyConfig(req.body, "post");
    // if (!value.status) {
    //     next(new AppError(400, value.message));
    //     return;
    // }
    try {
        const authUser = req.user._id;
        const createdAt = new Date();
        const clientMonthlyConfig = await ClientMonthlyConfigModel.create({ ...req.body, created_by: authUser, created_at: createdAt });
        res.status(201).json({
            status: "success",
            clientMonthlyConfig
        });
    } catch (error) {
        return next(new AppError(400, error.message));
    }
}
exports.updateClientMonthlyConfig = async (req, res, next) => {
    // const value = await validateClientMonthlyConfig(req.body, "put");
    // if (!value.status) {
    //     return next(new AppError(400, value.message));
    // }
    //while updating also inclue company id from user for more security

    try {
        const authUser = req.user._id;
        const updatedAt = new Date();
        const config = await ClientMonthlyConfigModel.findById(req.params.id);
        if (!config) {
            return next(new AppError(404, "Unable to find Document with given Id."));
        }
        if (new Date(config.created_for_month) < new Date()) {
            return next(new AppError(400, "You cannot edit."));
        }
        const clientMonthlyConfig = await ClientMonthlyConfigModel.findByIdAndUpdate(req.params.id, {
            ...req.body,
            updated_by: authUser,
            updated_at: updatedAt
        }, { new: true });
        res.status(200).json({
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
    const { time_stamp } = req.body;
    try {
        const { brand_id, _id } = req.user;
        const createdAt = new Date();
        let clientMonthlyConfig = await ClientMonthlyConfigModel.findOne({
            created_for_month: time_stamp,
            brand_id
        });
        if (!clientMonthlyConfig) {
            const clientDetails = await ClientDetails.findOne({ brand_id });
            const { category } = clientDetails;
            const category_array = category.map(el => {
                return {
                    category: el,
                    ad_sales: "",
                    spend: "",
                    for_month: time_stamp
                }

            });
            clientMonthlyConfig = await ClientMonthlyConfigModel.create({
                category_wise_sales_and_spend_target: category_array,
                created_for_month: time_stamp,
                brand_id,
                created_by: _id,
                created_at: createdAt
            })

        }
        res.status(200).json({
            status: "success",
            data: {
                clientMonthlyConfig
            }
        });
    } catch (error) {
        console.log(error)
        res.status(404).json({
            status: "fail",
            data: {
                error
            }
        });
    }
}
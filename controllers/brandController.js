const BrandModel = require("../models/brandModel");
const AppError = require("../utils/errorHandling/AppError");
const { UNABLE_TO_UPDATE_DATA } = require("../constants/errorMessageConstants/dashboardController")
exports.updateBrand = async (req, res, next) => {
    try {
        const brand = await BrandModel.findByIdAndUpdate(req.user.brand_id, { config_edit: false }, { new: true });
        res.status(200).json({
            status: "success",
            data: {
                message: "Data updated successfully."
            }
        })
    } catch (error) {
        return next(new AppError(400, UNABLE_TO_UPDATE_DATA));
    }
}
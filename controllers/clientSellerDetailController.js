const ClientSellerDetailModel = require("../models/clientSellerDetail");
const { UNABLE_TO_GET_DATA, UNABLE_TO_UPDATE_DATA } = require("../constants/errorMessageConstants/dashboardController");
const AppError = require("../utils/errorHandling/AppError");
exports.getClientSellerDetail = async (req, res, next) => {
    try {
        const { brand_id } = req.user;
        const seller_data_array = await ClientSellerDetailModel.find({ brand_id });
        res.status(200).json({
            status: "success",
            data: {
                seller_data_array
            }
        })
    } catch (error) {
        return next(new AppError(400, UNABLE_TO_GET_DATA))
    }
}
exports.updateClientSellerDetail = async (req, res, next) => {
    //Error handling is pending
    try {
        const seller = await ClientSellerDetailModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            status: "success",
            data: {
                seller
            }
        });
    } catch (error) {
        return next(new AppError(400, UNABLE_TO_UPDATE_DATA));
    }
}
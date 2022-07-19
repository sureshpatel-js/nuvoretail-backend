const ProductAdsModel = require("../models/productAdsModel");
const AppError = require("../utils/errorHandling/AppError");
exports.createProductAdsData = async (req, res, next) => {
    try {
        const newProductAds = await ProductAdsModel.create(req.body);
        res.status(201).json({
            status: "success"
        });
    } catch (error) {
        return next(new AppError(400, "Unable to create product ads data."));
    }
} 
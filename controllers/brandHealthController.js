const BrandHealthMoldel = require("../models/brandHealthModel");
const AppError = require("../utils/errorHandling/AppError");
exports.createOneBrandHealth = async (req, res, next) => {
    try {
        const newBrandHealth = await BrandHealthMoldel.create(req.body)
        res.status(201).json({
            status: "success",
            data: {
                message: "Data added successfully."
            }
        })
    } catch (error) {
        console.log(error);
        return next(new AppError(400, ""));
    }

}
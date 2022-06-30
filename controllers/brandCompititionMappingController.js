const brandCompititionMappingModel = require("../models/brandCompititionMappingModel");
const { validateBrandCompititionMapping } = require("../validate/validateBrandCompititionMapping");
exports.createBrandCompititionMapping = async (req, res, next) => {
    const value = await validateBrandCompititionMapping(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    try {
        const brandCompititionMapping = await brandCompititionMappingModel.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                brandCompititionMapping
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
}
const ProductMasterModel = require("../models/productMasterModel");

exports.createProductMaster = async (req, res, next) => {
    try {
        newProductMaster = await ProductMasterModel.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                newProductMaster
            }
        })
    } catch (error) {
        console.log(error);
    }
}

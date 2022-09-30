const ClientProductDetailModel = require("../models/clientProductDetailModel");
//const KeywordDumpModel = require("../models/keywordDumpModel");
const { UNABLE_TO_GET_DATA,UNABLE_TO_UPDATE_DATA } = require("../constants/errorMessageConstants/dashboardController")
// const { validateOnbordingCrawledData,
//     validateManyOnbordingCrawledData
// } = require("../validate/validateOnbordingCrawledData");
const AppError = require("../utils/errorHandling/AppError");
exports.getClientProductDetail = async (req, res, next) => {
    try {
        const product_data_array = await ClientProductDetailModel.find();
        res.status(200).json({
            status: "success",
            data: {
                product_data_array
            }
        });
    } catch (error) {
        return next(new AppError(400, UNABLE_TO_GET_DATA));
    }
};

exports.updateClientProductDetail = async (req, res, next) => {
    //Error handling is pending
    try {
        const product = await ClientProductDetailModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            status: "success",
            data: {
                product
            }
        });
    } catch (error) {
        return next(new AppError(400, UNABLE_TO_UPDATE_DATA));
    }
}

// exports.createOnbordingCrawledData = async (req, res, next) => {
//     const value = await validateOnbordingCrawledData(req.body);
//     if (!value.status) {
//         next(new AppError(400, value.message));
//         return;
//     }
//     try {
//         const crolledData = await ClientProductDetailModel.create(req.body);
//         res.status(201).json({
//             status: "success",
//             data: {
//                 crolledData
//             }
//         });
//     } catch (error) {
//         res.status(400).json({
//             status: "fail",
//             data: {
//                 error
//             }
//         });
//     }
// };

// exports.createManyOnbordingCrawledData = async (req, res, next) => {
//     const value = await validateManyOnbordingCrawledData(req.body);
//     if (!value.status) {
//         return next(new AppError(400, value.message));
//     }
//     try {
//         const { onbordingCrawledData } = req.body;
//         const crolledData = await ClientProductDetailModel.insertMany(onbordingCrawledData);
//         res.status(201).json({
//             status: "success",
//             data: {
//                 message: "Documents insereted successfully."
//             }
//         });
//     } catch (error) {
//         return next(new AppError(400, error));

//     }
// };


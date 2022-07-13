const SentimentModel = require("../models/sentimentModel");
const AppError = require("../utils/errorHandling/AppError");
exports.createOneSentiment = async (req, res, next) => {
    try {
        const newSentiment = await SentimentModel.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                message: "Data added successfully."
            }
        })
    } catch (error) {
        console.log(error);
        return next(new AppError(500, UNABLE_TO_CREATE_USER));
    }
}
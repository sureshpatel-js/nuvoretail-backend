const OsaMoldel = require("../models/osaModel");
const AppError = require("../utils/errorHandling/AppError");
exports.createOneOsa = async (req, res, next) => {
    try {
        const newOsa = await OsaMoldel.create(req.body)
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


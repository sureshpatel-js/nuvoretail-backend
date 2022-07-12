const OsaMoldel = require("../models/osaModel");

exports.createOneOsa = async (req, res, next) => {
    try {
        const newOsa = await OsaMoldel.create()
        res.status(201).json({
            status: "success",
            data: {
                message: "Data added successfully."
            }
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: "fail",
            data: {

            }
        })
    }

}
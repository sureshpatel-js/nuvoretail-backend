const ClientMonthlyConfigModel = require("../models/clientMonthlyConfigModel");
exports.getPlatformCodes = async (time_stamp, brand_id) => {
    const date = new Date(time_stamp);
    try {
        const obj = await ClientMonthlyConfigModel.findOne({
            $expr: { $and: [{ $eq: [{ $month: "$created_for_month" }, date.getMonth() + 1] }, { $eq: [{ $year: "$created_for_month" }, date.getFullYear()] }] },
            brand_id
        });
        const platform_code = [];
        for (let platform_code_obj of obj.product_list) {
            platform_code.push(platform_code_obj.platform_code);
        }
        return platform_code
    } catch (error) {
        console.log(error);
        return false
    }

}
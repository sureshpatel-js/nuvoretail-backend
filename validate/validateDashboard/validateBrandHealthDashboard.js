const Joi = require("joi");
exports.validateBrandHealthDashboardBody = async (body) => {
    const schema = Joi.object({
       start_date:Joi.date().required(),
       end_date:Joi.date().required()
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};
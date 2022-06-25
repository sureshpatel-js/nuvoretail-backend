const Joi = require("joi");

exports.validateBrandCompititionMapping = async (body) => {
    const schema = Joi.object({
        brand_name: Joi.string().required(),
        strong_compitition: Joi.boolean().required()
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};
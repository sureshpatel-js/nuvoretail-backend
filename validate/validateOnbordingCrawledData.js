const Joi = require("joi");

exports.validateOnbordingCrawledData = async (body) => {
    const schema = Joi.object({
        brand_id: Joi.string().required(),
        platform_code: Joi.string().required(),
        platform: Joi.string().required(),
        product_name: Joi.string().required(),
        sp: Joi.string().allow(""),
        pack_size: Joi.string().allow(""),
        mrp: Joi.string().allow(""),
        seller: Joi.string().allow(""),
        main_cat: Joi.string().allow(""),
        sub_cat: Joi.string().allow(""),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};
exports.validateManyOnbordingCrawledData = async (body) => {
    const schema = Joi.object({
        onbordingCrawledData: Joi.array().min(1).items(Joi.object({
            brand_id: Joi.string().required(),
            platform_code: Joi.string().required(),
            platform: Joi.string().required(),
            product_name: Joi.string().required(),
            sp: Joi.string().allow(""),
            pack_size: Joi.string().allow(""),
            mrp: Joi.string().allow(""),
            seller: Joi.string().allow(""),
            main_cat: Joi.string().allow(""),
            sub_cat: Joi.string().allow(""),
        })).required(),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
}
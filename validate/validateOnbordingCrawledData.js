const Joi = require("joi");

exports.validateOnbordingCrawledData = async (body) => {
    const schema = Joi.object({
        user_id: Joi.string().required(),
        platform_code: Joi.string().required(),//lenth =10;
        product_code: Joi.string().required(),
        pname: Joi.string().required(),
        brand_name: Joi.string().required(),
        sp: Joi.number().required(),
        pack_size: Joi.string().required(),
        mrp: Joi.number().required(),
        seller: Joi.string().required(),
        main_cat: Joi.string().required(),
        sub_cat: Joi.string().required(),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

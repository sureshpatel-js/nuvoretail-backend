const Joi = require("joi");

exports.validateClientMonthlyConfigStageOne = async (body) => {
    const schema = Joi.object({
        user_id: Joi.string().required(),
        product_list: Joi.array().items(Joi.object({
            product_code: Joi.string().required(),
            priority: Joi.boolean().required()
        })).required(),
        authorized_seller_list: Joi.array().items(Joi.object({
            seller_name: Joi.string().required(),
            fba_model: Joi.boolean().required()
        })).required(),
        stage_one_created_date: Joi.date().required(),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

exports.validateClientMonthlyConfigStageTwo = async (body) => {
    const schema = Joi.object({
        keyword_budget: Joi.object({
            total_budget: Joi.number().required(),
            brand_dist: Joi.number().required(),
            core_generic_dist: Joi.number().required(),
            non_core_generic_dist: Joi.number().required(),
            comp_dist: Joi.number().required(),
            month_budget_dist: Joi.array().items(Joi.object({
                start_date: Joi.date().required(),
                end_date: Joi.date().required(),
                budget_dist: Joi.number().required()
            })).required(),
        }).required(),
        prioritize_competitor: Joi.array().items(Joi.object({
            brand_name: Joi.string().required(),
            priority: Joi.boolean().required(),
            close_competitor: Joi.boolean().required(),
        })).required(),
        stage_two_created_date: Joi.date().required(),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

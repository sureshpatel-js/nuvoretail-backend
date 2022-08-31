const Joi = require("joi");

exports.validateClientMonthlyConfig = async (body, reqType) => {
    let schema;
    if (reqType === "post") {
        schema = Joi.object({
            product_list: Joi.array().items(Joi.object({
                platform_code: Joi.string().required(),
                priority: Joi.boolean().required()
            })).required(),
            authorized_seller_list: Joi.array().items(Joi.object({
                seller_name: Joi.string().required(),
                fba_model: Joi.boolean().required()
            })).required(),
            keyword_budget: Joi.object({
                total_budget: Joi.number().required(),
                monthly_budget: Joi.number().required(),
                target_acos: Joi.number().required(),
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
            brand_id: Joi.string().required(),
            created_for_month:Joi.date().required()
        });
    } else if (reqType === "put") {
        schema = Joi.object({
            product_list: Joi.array().items(Joi.object({
                platform_code: Joi.string().required(),
                priority: Joi.boolean().required()
            })).required(),
            authorized_seller_list: Joi.array().items(Joi.object({
                seller_name: Joi.string().required(),
                fba_model: Joi.boolean().required()
            })).required(),
            keyword_budget: Joi.object({
                total_budget: Joi.number().required(),
                monthly_budget: Joi.number().required(),
                target_acos: Joi.number().required(),
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
            brand_id: Joi.string().required(),
            created_for_month:Joi.date().required()
        });
    }
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

const Joi = require("joi");

exports.validateClientAdminSignUp = async (body) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        company_name:Joi.string().required(),
        brand_name:Joi.string().required(),
        email: Joi.string()
            .required()
            .email({
                minDomainSegments: 2,
                tlds: { allow: ["com", "net"] },
            }),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

exports.validateCreateClientSideUser = async (body) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        user_type: Joi.string().valid("client-junior-admin","client-manager").required(),
        email: Joi.string()
            .required()
            .email({
                minDomainSegments: 2,
                tlds: { allow: ["com", "net"] },
            }),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

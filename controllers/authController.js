const UserModel = require("../models/userModel");
const AppError = require("../utils/errorHandling/AppError");
const { validateSetPasswordBody, validateLogIn } = require("../validate/validateAuth");
const { checkOtp } = require("../utils/auth/otp");
const bcrypt = require("bcrypt");
const { UNABLE_TO_CREATE_PASSWORD,
    YOU_HAVE_NOT_CREATED_PASSWORD_YET
} = require("../constants/errorConstants/authControllerError");
const { getJwt } = require("../utils/auth/jwt");
const { checkPassword } = require("../utils/auth/password");
exports.setPassword = async (req, res, next) => {
    const value = await validateSetPasswordBody(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    const { email, password, otp } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({
                message: `User does not exist with this ${email} email.`,
            });
            return;
        }
        const { otp_created_at, hashed_otp } = user;
        const { status, message } = await checkOtp({
            otp,
            hashedOtp: hashed_otp,
            otpCreatedAt: otp_created_at,
        });
        if (!status) {
            res.status(400).json({
                status: "fail",
                data: {
                    error: message,
                }
            });
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const password_updated_at = new Date().getTime();
        await UserModel.findByIdAndUpdate(user._id, {
            hashed_password: hashPassword,
            password_updated_at,
            hashed_otp: null,
            otp_created_at: null,
            email_verified: true
        });
        res.status(201).json({
            message: "Password updated successfully.",
        });
    } catch (error) {
        console.log(error);
        next(new AppError(500, UNABLE_TO_CREATE_PASSWORD));
        return;
    }
};

exports.logIn = async (req, res, next) => {
    const { email, password } = req.body;
    const value = await validateLogIn(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
        res.status(404).json({
            message: `User does not exist with this ${email} email.`,
        });
        return;
    }
    if (!user.hashed_password) {
        next(new AppError(400, YOU_HAVE_NOT_CREATED_PASSWORD_YET));
        return;
    }
    const { status, message } = await checkPassword({
        hashedPassword: user.hashed_password,
        password,
    });
    if (!status) {
        res.status(401).json({
            status: "fail",
            data: {
                error: message,
            }
        });
        return;
    }
    const tokenObj = await getJwt(user._id);
    if (!tokenObj.status) {
        next(new AppError(500, tokenObj.message));
        return;
    }
    const { token } = tokenObj;
    res.status(200).json({
        status: "success",
        data: {
            message: "You are logged in successfully.",
            token,
            user: {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        }
    });
};

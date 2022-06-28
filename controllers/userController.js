//Client controller
const UserModel = require("../models/userModel");
const { validateClientAdminSignUp } = require("../validate/validateUser");
const { generateOtpAndTime } = require("../utils/auth/otp");
const AppError = require("../utils/errorHandling/AppError");
const sendMail = require("../utils/nodemailer/nodemailer");
const { UNABLE_TO_SEND_OTP,
    UNABLE_TO_CREATE_USER
} = require("../constants/errorConstants/userControllerError");

exports.clientAdminSignUp = async (req, res, next) => {
    const value = await validateClientAdminSignUp(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    try {
        const { first_name, email } = req.body;
        const { otp, hashedOtp, otpCreatedAt } = await generateOtpAndTime();
        console.log(otp, hashedOtp, otpCreatedAt)
        const sendMailStatus = await sendMail(
            email,
            "OTP Verification.",
            ``,
            `Hi ${first_name}, please use this OTP to verify your email address.</br> <b>${otp}</b> `,

        );
        if (!sendMailStatus) {
            next(new AppError(400, UNABLE_TO_SEND_OTP));
            return;
        }
        const { body } = req;
        const newUser = await UserModel.create({
            ...body,
            hashed_otp: hashedOtp,
            otp_created_at: otpCreatedAt,
            email_verified: false
        });
        res.status(201).json({
            message: `Check your email: ${email} for OTP.`,
            user: {
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email,
            },
        });
    } catch (error) {
        console.log(error);
        next(new AppError(500, UNABLE_TO_CREATE_USER));
        return;
    }

}


const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
const CompanyModel = require("../models/companyModel");
const BrandModel = require("../models/brandModel");
const { validateClientAdminSignUp } = require("../validate/validateUser");
const { generateOtpAndTime } = require("../utils/auth/otp");
const AppError = require("../utils/errorHandling/AppError");
const sendMail = require("../utils/nodemailer/nodemailer");
const { UNABLE_TO_SEND_OTP,
    UNABLE_TO_CREATE_USER,
    USER_ALREADY_EXIST
} = require("../constants/errorMessageConstants/userControllerError");
exports.clientAdminSignUp = async (req, res, next) => {
    const value = await validateClientAdminSignUp(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));

    }
    //Step 1 Find user.
    const findUser = await UserModel.findOne({ email: req.body.email });
    //If user exist and email is verified, then return to login page.
    if (findUser && findUser.email_verified === true) {
        return next(new AppError(409, USER_ALREADY_EXIST));
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { first_name, last_name, email, company_name, brand_name } = req.body;
        const { otp, hashedOtp, otpCreatedAt } = await generateOtpAndTime();

        let newUser;
        //If user does not exist create one and send otp
        if (!findUser) {
            newUser = await UserModel.create([{
                first_name,
                last_name,
                email,
                hashed_otp: hashedOtp,
                otp_created_at: otpCreatedAt,
                email_verified: false,
                user_type: "client-admin"
            }], { session });

            const newUserId = newUser[0]._id;
            const newCompany = await CompanyModel.create([{
                company_name,
                created_by: newUserId,
            }], { session })

            const newCompanyId = newCompany[0]._id;

            const newBrand = await BrandModel.create([{
                brand_name,
                created_by: newUserId,
                company_id: newCompanyId
            }], { session })

            const updatedUser = await UserModel.findByIdAndUpdate(
                newUserId,
                {
                    company_id: newCompanyId
                },
                { session }
            )

            //If user exist and email is not verified, then send otp and update user.
        } else if (findUser && findUser.email_verified === false) {
            newUser = await UserModel.findByIdAndUpdate(findUser._id, {
                hashed_otp: hashedOtp,
                otp_created_at: otpCreatedAt,
            },
                { session }
            );
        }
        const sendMailStatus = await sendMail(
            email,
            "OTP Verification.",
            ``,
            `Hi ${first_name}, please use this OTP to verify your email address.</br> <b>${otp}</b> `,
        );
        if (!sendMailStatus) {
            return next(new AppError(500, UNABLE_TO_SEND_OTP));
        }

        await session.commitTransaction();

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
        await session.abortTransaction();
        return next(new AppError(500, UNABLE_TO_CREATE_USER));
    }
    session.endSession();
}


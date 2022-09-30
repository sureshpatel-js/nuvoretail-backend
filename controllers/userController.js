const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
//const CompanyModel = require("../models/companyModel");
const BrandModel = require("../models/brandModel");
const { validateClientAdminSignUp,
    validateCreateClientSideUser,
    validateCreateInternalUser
} = require("../validate/validateUser");
const { generateOtpAndTime } = require("../utils/auth/otp");
const { generateRandomPassword } = require("../utils/auth/password");
const AppError = require("../utils/errorHandling/AppError");
const sendMail = require("../utils/nodemailer/nodemailer");
const { UNABLE_TO_SEND_OTP,
    UNABLE_TO_CREATE_USER,
    USER_ALREADY_EXIST,
    UNABLE_TO_SEND_CREDENTIALS_ON_EMAIL
} = require("../constants/errorMessageConstants/userControllerError");
const { CLIENT_ADMIN } = require("../constants/constants");
const bcrypt = require("bcrypt");

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
                user_type: CLIENT_ADMIN
            }], { session });

            const newUserId = newUser[0]._id;
            // const newCompany = await CompanyModel.create([{
            //     company_name,
            //     created_by: newUserId,
            // }], { session })



            const newBrand = await BrandModel.create([{
                brand_name,
                created_by: newUserId,
            }], { session })
            const newBrandId = newBrand[0]._id;
            const updatedUser = await UserModel.findByIdAndUpdate(
                newUserId,
                {
                    brand_id: newBrandId
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
                first_name,
                last_name,
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

exports.createClientAdmin = async (req, res, next) => {
    const value = await validateClientAdminSignUp(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));
    }
    //Step 1 Find user.
    const findUser = await UserModel.findOne({ email: req.body.email });
    //If user exist and email is verified, then return to login page.
    if (findUser) {
        return next(new AppError(409, USER_ALREADY_EXIST));
    }
    const { _id } = req.user;
    const session = await mongoose.startSession();
    const plainTextPassword = generateRandomPassword();
    const hashPassword = await bcrypt.hash(`${plainTextPassword}`, 10);
    const password_updated_at = new Date().getTime();
    try {
        session.startTransaction();
        const { first_name, last_name, email, company_name, brand_name } = req.body;
        let newUser = await UserModel.create([{
            first_name,
            last_name,
            email,
            hashed_password: hashPassword,
            password_updated_at,
            hashed_otp: null,
            otp_created_at: null,
            email_verified: true,
            created_by: _id,
            user_type: CLIENT_ADMIN
        }], { session });

        const newUserId = newUser[0]._id;
        // const newCompany = await CompanyModel.create([{
        //     company_name,
        //     created_by: newUserId,
        // }], { session })


        const newBrand = await BrandModel.create([{
            brand_name,
            created_by: newUserId,
        }], { session })

        const newBrandId = newBrand[0]._id;
        const updatedUser = await UserModel.findByIdAndUpdate(
            newUserId,
            {
                brand_id: newBrandId
            },
            { session }
        )


        const sendMailStatus = await sendMail(
            email,
            "Login Credentials.",
            ``,
            `Hi ${first_name}, your login credentials for <h1>www.enlytical.com</h1> are given below.</br> 
            <b>${email}</b> </br>
            <b>${plainTextPassword}</b>`,
        );
        if (!sendMailStatus) {
            return next(new AppError(500, UNABLE_TO_SEND_CREDENTIALS_ON_EMAIL));
        }
        await session.commitTransaction();
        res.status(201).json({
            message: `User ${first_name} ${last_name} created successfully..`,
            user: {
                first_name,
                last_name,
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









exports.createClientSideUser = async (req, res, next) => {
    const value = await validateCreateClientSideUser(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));

    }
    //Step 1 Find user.
    const findUser = await UserModel.findOne({ email: req.body.email });
    //If user exist and email is verified, then return to login page.
    if (findUser && findUser.email_verified === true) {
        return next(new AppError(409, USER_ALREADY_EXIST));
    }
    const { company_id, _id } = req.user;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { first_name, last_name, user_type, email } = req.body;
        const plainTextPassword = generateRandomPassword();
        const hashPassword = await bcrypt.hash(`${plainTextPassword}`, 10);
        const password_updated_at = new Date().getTime();
        let [newUser] = await UserModel.create([{
            first_name,
            last_name,
            company_id,
            email,
            hashed_password: hashPassword,
            password_updated_at,
            hashed_otp: null,
            otp_created_at: null,
            email_verified: true,
            user_type,
            created_by: _id
        }], { session });

        const sendMailStatus = await sendMail(
            email,
            "Login Credentials.",
            ``,
            `Hi ${first_name}, your login credentials for <h1>www.enlytical.com</h1> are given below.</br> 
            <b>${email}</b> </br>
            <b>${plainTextPassword}</b>`,
        );
        if (!sendMailStatus) {
            return next(new AppError(500, UNABLE_TO_SEND_CREDENTIALS_ON_EMAIL));
        }

        await session.commitTransaction();
        res.status(201).json({
            message: `User ${newUser.first_name} ${newUser.last_name} created successfully..`,
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



exports.createInternalUser = async (req, res, next) => {
    const value = await validateCreateInternalUser(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));

    }
    //Step 1 Find user.
    const findUser = await UserModel.findOne({ email: req.body.email });
    //If user exist and email is verified, then return to login page.
    if (findUser && findUser.email_verified === true) {
        return next(new AppError(409, USER_ALREADY_EXIST));
    }
    const { company_id, _id } = req.user;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { first_name, last_name, user_type, email } = req.body;
        const plainTextPassword = generateRandomPassword();
        const hashPassword = await bcrypt.hash(`${plainTextPassword}`, 10);
        const password_updated_at = new Date().getTime();
        let [newUser] = await UserModel.create([{
            first_name,
            last_name,
            company_id,
            email,
            hashed_password: hashPassword,
            password_updated_at,
            hashed_otp: null,
            otp_created_at: null,
            email_verified: true,
            user_type,
            created_by: _id
        }], { session });

        const sendMailStatus = await sendMail(
            email,
            "Login Credentials.",
            ``,
            `Hi ${first_name}, your login credentials for <h1>www.enlytical.com</h1> are given below.</br> 
            <b>${email}</b> </br>
            <b>${plainTextPassword}</b>`,
        );
        if (!sendMailStatus) {
            return next(new AppError(500, UNABLE_TO_SEND_CREDENTIALS_ON_EMAIL));
        }

        await session.commitTransaction();
        res.status(201).json({
            message: `User ${newUser.first_name} ${newUser.last_name} created successfully..`,
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


exports.getMyObj = async (req, res, next) => {
    const { first_name, last_name, user_type, email } = req.user;
    res.status(200).json({
        status: "success",
        data: {
            user: {
                first_name,
                last_name,
                user_type,
                email
            }
        }
    })
}

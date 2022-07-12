const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    user_type: {
        type: String
    },
    email: {
        type: String,
    },
    company_id: {
        type: Schema.Types.ObjectId
    },
    contact_num: {
        type: String,
    },
    created_at: {
        type: Date
    },
    updated_at: {
        rtpe: Date
    },
    created_by: {
        type: Schema.Types.ObjectId
    },
    hashed_password: {
        type: String,
    },
    password_updated_at: {
        type: Number,
    },
    hashed_otp: {
        type: String,
    },
    otp_created_at: {
        type: Number,
    },
    last_login_at: {
        type: Date
    },
    active_status: {
        type: Boolean
    },
    email_verified: {
        type: Boolean
    }
})

// UserSchema.pre("save", function (next) {
//     this.company_id = this._id;
//     next();
// })

const User = mongoose.model("user", UserSchema);
module.exports = User;
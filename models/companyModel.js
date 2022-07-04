const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CompanySchema = new Schema({
    company_name: {
        type: String
    },
    created_by: {
        type: Schema.Types.ObjectId
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
})

const Company = mongoose.model("company", CompanySchema);
module.exports = Company;




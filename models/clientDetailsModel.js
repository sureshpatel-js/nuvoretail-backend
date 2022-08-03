const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientDetailsSchema = new Schema({
    client_profile_id: {
        type: String
    },
    client_name: {
        type: String
    },
    client_main: {
        type: String
    },
})

const ClientDetails = mongoose.model("clientDetails", ClientDetailsSchema);
module.exports = ClientDetails;




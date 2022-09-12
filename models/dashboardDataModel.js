const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DashboardDataSchema = new Schema({
    category: {
        type: Array
    }
})

const DashboardData = mongoose.model("dashboardData", DashboardDataSchema);
module.exports = DashboardData;
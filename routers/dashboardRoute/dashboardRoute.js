const express = require("express");
const brandHealthDashboardController = require("../../controllers/dashboardController/brandHealthDashbodrdController");
const router = express.Router();

router
    .route("/getBrandHealthDashboardData")
    .post(brandHealthDashboardController.getBrandHealthDashboardData);
router
    .route("/getOneDayBrandHealthDashboardData")
    .post(brandHealthDashboardController.getOneDayBrandHealthDashboardData);



module.exports = router;
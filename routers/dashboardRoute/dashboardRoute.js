const express = require("express");
const brandHealthDashboardController = require("../../controllers/dashboardController/brandHealthDashbodrdController");
const router = express.Router();

router
    .route("/getStaticData")
    .post(brandHealthDashboardController.getStaticData);
router
    .route("/getProductWiseStatus")
    .post(brandHealthDashboardController.getProductWiseStatus);
router
    .route("/getBrandWiseStatus")
    .post(brandHealthDashboardController.getBrandWiseStatus);
router
    .route("/getAdvSalesAndAcosGraphData")
    .post(brandHealthDashboardController.getAdvSalesAndAcos);


module.exports = router;
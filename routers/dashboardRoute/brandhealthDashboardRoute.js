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

router
    .route("/getAvailabilityAndBuyboxGraphData")
    .post(brandHealthDashboardController.getAvailabilityAndBuybox);

router
    .route("/getAdvSpendsAndCpcGraphData")
    .post(brandHealthDashboardController.getAdvSpendsAndCpc);

router
    .route("/getCtrAndConversionGraphData")
    .post(brandHealthDashboardController.getCtrAndConversion);

router
    .route("/getClicksOrdersAndImpressions")
    .post(brandHealthDashboardController.getClicksOrdersAndImpressions);

router
    .route("/getCityWiseDeliveryDaysGraphData")
    .post(brandHealthDashboardController.getCityWiseDeliveryDays);

router
    .route("/getPrice")
    .post(brandHealthDashboardController.getPrice);

router
    .route("/getDiscount")
    .post(brandHealthDashboardController.getDiscount);

router
    .route("/getCategoryAndShelfRank")
    .post(brandHealthDashboardController.getCategoryAndShelfRank);

router
    .route("/getCountOfTopAndRecentReviews")
    .post(brandHealthDashboardController.getCountOfTopAndRecentReviews);

router
    .route("/getRatingsAndReviews")
    .post(brandHealthDashboardController.getRatingsAndReviews);


module.exports = router;



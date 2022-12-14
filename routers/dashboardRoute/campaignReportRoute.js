const express = require("express");
const campaignReportController = require("../../controllers/dashboardController/campaignReportController");
const router = express.Router();
router
    .route("/getTileData")
    .post(campaignReportController.getTileData);
router
    .route("/getGraphData")
    .post(campaignReportController.getGraphData);

router
    .route("/getDashboardData")
    .post(campaignReportController.getDashboardData);

router
    .route("/getCategoryTableData")
    .post(campaignReportController.getCategoryTableData);

router
    .route("/getTargetsTableData")
    .post(campaignReportController.getTargetsTableData);

router
    .route("/getRemainingTargetsTileData")
    .post(campaignReportController.getRemainingTargetsTileData);

module.exports = router;    
const express = require("express");
const router = express.Router();
const powerBiConfigController = require("../../controllers/powerBi/powerBiConfigController");
const authController = require("../../controllers/authController");
const { CLIENT_ADMIN, ENLYTICAL_ADMIN } = require("../../constants/constants")
router
    .route("/")
    .post(authController.protectRoute, authController.restrictTo(ENLYTICAL_ADMIN), powerBiConfigController.createPowerBiConfig);
router
    .route("/getEmbedInfo/:id").get(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN, ENLYTICAL_ADMIN), powerBiConfigController.getEmbedInfo)
router
    .route("/getPowerBiDashboardMenuArray")
    .get(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN, ENLYTICAL_ADMIN), powerBiConfigController.getPowerBiDashboardMenuArray);
router
    .route("/getEmbedInfoByGroupAndReportId")
    .post(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN, ENLYTICAL_ADMIN), powerBiConfigController.getEmbedInfoByGroupAndReportId)

module.exports = router;

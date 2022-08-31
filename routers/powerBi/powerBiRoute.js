const express = require("express");
const router = express.Router();
const powerBiConfigController = require("../../controllers/powerBi/powerBiConfigController");
const authController = require("../../controllers/authController");
const { CLIENT_ADMIN, ENLYTICAL_ADMIN } = require("../../constants/constants")
router
    .route("/")
    .post(authController.protectRoute, authController.restrictTo(ENLYTICAL_ADMIN), powerBiConfigController.createPowerBiConfig);
router
    .route("/getEmbedInfo").get(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN, ENLYTICAL_ADMIN), powerBiConfigController.getEmbedInfo)

module.exports = router;

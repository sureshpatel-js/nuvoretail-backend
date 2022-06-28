const express = require("express");
const clientMonthlyConfigController = require("../controllers/clientMonthlyConfigController");
const router = express.Router();
router
    .route("/")
    .get(clientMonthlyConfigController.getClientMonthlyConfig);
router
    .route("/stageOne")
    .post(clientMonthlyConfigController.createClientMonthlyConfigStageOne);
router
    .route("/stageTwo/:id")
    .put(clientMonthlyConfigController.createClientMonthlyConfigStageTwo);


module.exports = router;
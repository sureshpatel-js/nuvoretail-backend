const express = require("express");
const clientMonthlyConfigController = require("../controllers/clientMonthlyConfigController");
const router = express.Router();
router
    .route("/")
    .get(clientMonthlyConfigController.getClientMonthlyConfig);
router
    .route("/stageOne/:id?")
    .post(clientMonthlyConfigController.createClientMonthlyConfigStageOne)
    .put(clientMonthlyConfigController.updateClientMonthlyConfigStageOne);
router
    .route("/stageTwo/:id")
    .put(clientMonthlyConfigController.createClientMonthlyConfigStageTwo);


module.exports = router;
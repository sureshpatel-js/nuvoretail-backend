const express = require("express");
const clientMonthlyConfigController = require("../controllers/clientMonthlyConfigController");
const router = express.Router();
router
    .route("/")
    .get(clientMonthlyConfigController.getClientMonthlyConfig);
router
    .route("/:id?")
    .post(clientMonthlyConfigController.createClientMonthlyConfig)
    .put(clientMonthlyConfigController.updateClientMonthlyConfig);


module.exports = router;
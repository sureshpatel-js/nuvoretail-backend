const express = require("express");
const clientMonthlyConfigController = require("../controllers/clientMonthlyConfigController");
const authController = require("./../controllers/authController");
const router = express.Router();
router
    .route("/")
    .get(clientMonthlyConfigController.getClientMonthlyConfig);
router
    .route("/:id?")
    .post(authController.protectRoute, clientMonthlyConfigController.createClientMonthlyConfig)
    .put(clientMonthlyConfigController.updateClientMonthlyConfig);


module.exports = router;
const express = require("express");
const clientMonthlyConfigController = require("../controllers/clientMonthlyConfigController");
const authController = require("./../controllers/authController");
const router = express.Router();
router
    .route("/monthlyBudget")
    .post( authController.protectRoute ,clientMonthlyConfigController.getClientMonthlyConfig);
router
    .route("/:id?")
    .post(clientMonthlyConfigController.createClientMonthlyConfig)
    .put(clientMonthlyConfigController.updateClientMonthlyConfig);


module.exports = router;
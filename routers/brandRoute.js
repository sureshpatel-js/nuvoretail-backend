const express = require("express");
const brandController = require("../controllers/brandController");
const authController = require("../controllers/authController");
const router = express.Router();

router
    .route("/")
    .put(authController.protectRoute, brandController.updateBrand);

module.exports = router;
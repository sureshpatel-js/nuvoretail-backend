const express = require("express");
const brandHealthController = require("../controllers/brandHealthController");
const router = express.Router();

router
    .route("/")
    .post(brandHealthController.createOneBrandHealth);

module.exports = router;
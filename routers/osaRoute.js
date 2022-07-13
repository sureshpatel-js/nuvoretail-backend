const express = require("express");
const osaController = require("../controllers/osaController");
const router = express.Router();

router
    .route("/")
    .post(osaController.createOneOsa);

module.exports = router;
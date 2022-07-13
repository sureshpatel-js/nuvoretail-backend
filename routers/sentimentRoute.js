const express = require("express");
const sentimentController = require("../controllers/sentimentController");
const router = express.Router();

router
    .route("/")
    .post(sentimentController.createOneSentiment);

module.exports = router;
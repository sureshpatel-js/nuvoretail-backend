const express = require("express");
const onbordingCrawledDataController = require("../conrollers/onbordingCrawledDataController");
const router = express.Router();

router
    .route("/")
    .get(onbordingCrawledDataController.getOnbordingCrawledData)
    .post(onbordingCrawledDataController.createOnbordingCrawledData);

module.exports = router;
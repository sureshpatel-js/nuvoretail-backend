const express = require("express");
const onbordingCrawledDataController = require("../controllers/onbordingCrawledDataController");
const authController = require("../controllers/authController");
const router = express.Router();

router
    .route("/")
    .get(onbordingCrawledDataController.getOnbordingCrawledData)
    .post(onbordingCrawledDataController.createOnbordingCrawledData);

router
    .route("/insertMany")
    .post(onbordingCrawledDataController.createManyOnbordingCrawledData);



module.exports = router;
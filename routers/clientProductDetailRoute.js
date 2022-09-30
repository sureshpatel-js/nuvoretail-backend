const express = require("express");
const clientProductDetailController = require("../controllers/clientProductDetailController");
const authController = require("../controllers/authController");
const router = express.Router();

router
    .route("/:id?")
    .get(clientProductDetailController.getClientProductDetail)
    .put(clientProductDetailController.updateClientProductDetail)
//.post(onbordingCrawledDataController.createOnbordingCrawledData);

// router
//     .route("/insertMany")
//     .post(onbordingCrawledDataController.createManyOnbordingCrawledData);



module.exports = router;
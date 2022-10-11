const express = require("express");
const clientProductDetailController = require("../controllers/clientProductDetailController");
const authController = require("../controllers/authController");
const router = express.Router();

router
    .route("/:id?")
    .get(authController.protectRoute, clientProductDetailController.getClientProductDetail)
    .put(authController.protectRoute, clientProductDetailController.updateClientProductDetail)
//.post(onbordingCrawledDataController.createOnbordingCrawledData);

// router
//     .route("/insertMany")
//     .post(onbordingCrawledDataController.createManyOnbordingCrawledData);



module.exports = router;
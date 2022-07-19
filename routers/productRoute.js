const express = require("express");
const productMasterController = require("../controllers/productMasterController");
const productAdsController = require("../controllers/productAdsController");
const router = express.Router();

router
    .route("/productMaster")
    .post(productMasterController.createProductMaster);

router
    .route("/productAds")
    .post(productAdsController.createProductAdsData);

module.exports = router;
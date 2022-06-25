const express = require("express");
const router = express.Router();
const brandCompititionMappingController = require("../conrollers/brandCompititionMappingController");
router
    .route("/")
    .get()
    .post(brandCompititionMappingController.createBrandCompititionMapping);

module.exports = router;    
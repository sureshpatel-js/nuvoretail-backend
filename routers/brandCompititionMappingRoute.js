const express = require("express");
const router = express.Router();
const brandCompititionMappingController = require("../controllers/brandCompititionMappingController");
router
    .route("/")
    .get()
    .post(brandCompititionMappingController.createBrandCompititionMapping);

module.exports = router;    
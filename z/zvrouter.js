const express = require("express");
const router = express.Router()
const visibilityController = require("../controller/visibilityController");
router.route("/create").post(visibilityController.createVisibility);
router.route("/get").post(visibilityController.getVisibility);
module.exports = router;
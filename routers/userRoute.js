const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router
    .route("/clientAdminSignUp")
    .post(userController.clientAdminSignUp);

module.exports = router;
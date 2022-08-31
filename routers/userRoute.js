const express = require("express");
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const { CLIENT_ADMIN, ENLYTICAL_ADMIN } = require("../constants/constants")
const router = express.Router();

router.
    route("/").
    get(authController.protectRoute, userController.getMyObj)

router
    .route("/clientAdminSignUp")
    .post(userController.clientAdminSignUp);
router
    .route("/createClientSideUser")
    .post(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN), userController.createClientSideUser);
router
    .route("/createInternalUser")
    .post(authController.protectRoute, authController.restrictTo(ENLYTICAL_ADMIN), userController.createInternalUser);

router
    .route("/createClientAdmin")
    .post(authController.protectRoute, authController.restrictTo(ENLYTICAL_ADMIN), userController.createClientAdmin);


module.exports = router;
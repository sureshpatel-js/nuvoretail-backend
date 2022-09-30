const express = require("express");
const clientSellerDetailController = require("../controllers/clientSellerDetailController");

const authController = require("../controllers/authController");
const router = express.Router();

router
    .route("/:id?")
    .get(clientSellerDetailController.getClientSellerDetail)
    .put(clientSellerDetailController.updateClientSellerDetail)



module.exports = router;
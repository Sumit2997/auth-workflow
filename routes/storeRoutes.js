const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");

const {
  createStore,
  getAllStores,
  getSingleStore,
  updateStore,
  deleteStore,
} = require("../controllers/storeController");

router.route("/").post(authenticateUser, createStore).get(getAllStores);

router
  .route("/:id")
  .get(getSingleStore)
  .patch(authenticateUser, updateStore)
  .delete(authenticateUser, deleteStore);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllSummarys,
  getSingleSummary,
  getCurrentUserSummarys,
  createSummary,
  updateSummary,
} = require("../controllers/summaryController");

router
  .route("/")
  .post(authenticateUser, createSummary)
  .get(authenticateUser, authorizePermissions("admin"), getAllSummarys);

router.route("/showAllMySummarys").get(authenticateUser, getCurrentUserSummarys);

router
  .route("/:id")
  .get(authenticateUser, getSingleSummary)
  .patch(authenticateUser, updateSummary);

module.exports = router;

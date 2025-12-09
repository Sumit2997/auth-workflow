const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createFlashcard,
  getAllFlashcards,
  getSingleFlashcard,
  updateFlashcard,
  deleteFlashcard,
  uploadImage,
} = require("../controllers/flashcardController");

const { getSingleFlashcardReviews } = require("../controllers/storeController");

router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createFlashcard)
  .get(getAllFlashcards);

router
  .route("/uploadImage")
  .post([authenticateUser, authorizePermissions("admin")], uploadImage);

router
  .route("/:id")
  .get(getSingleFlashcard)
  .patch([authenticateUser, authorizePermissions("admin")], updateFlashcard)
  .delete([authenticateUser, authorizePermissions("admin")], deleteFlashcard);

router.route("/:id/reviews").get(getSingleFlashcardReviews);

module.exports = router;

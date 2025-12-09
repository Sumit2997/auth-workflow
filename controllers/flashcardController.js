const flashcard = require("../models/flashcard");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createflashcard = async (req, res) => {
  req.body.user = req.user.userId;
  const flashcard = await flashcard.create(req.body);
  res.status(StatusCodes.CREATED).json({ flashcard });
};
const getAllflashcards = async (req, res) => {
  const flashcards = await flashcard.find({});

  res.status(StatusCodes.OK).json({ flashcards, count: flashcards.length });
};
const getSingleflashcard = async (req, res) => {
  const { id: flashcardId } = req.params;

  const flashcard = await flashcard.findOne({ _id: flashcardId }).populate("reviews");

  if (!flashcard) {
    throw new CustomError.NotFoundError(`No flashcard with id : ${flashcardId}`);
  }

  res.status(StatusCodes.OK).json({ flashcard });
};
const updateflashcard = async (req, res) => {
  const { id: flashcardId } = req.params;

  const flashcard = await flashcard.findOneAndUpdate({ _id: flashcardId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!flashcard) {
    throw new CustomError.NotFoundError(`No flashcard with id : ${flashcardId}`);
  }

  res.status(StatusCodes.OK).json({ flashcard });
};
const deleteflashcard = async (req, res) => {
  const { id: flashcardId } = req.params;

  const flashcard = await flashcard.findOne({ _id: flashcardId });

  if (!flashcard) {
    throw new CustomError.NotFoundError(`No flashcard with id : ${flashcardId}`);
  }

  await flashcard.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! flashcard removed." });
};
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const flashcardImage = req.files.image;

  if (!flashcardImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;

  if (flashcardImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${flashcardImage.name}`
  );
  await flashcardImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${flashcardImage.name}` });
};

module.exports = {
  createflashcard,
  getAllflashcards,
  getSingleflashcard,
  updateflashcard,
  deleteflashcard,
  uploadImage,
};

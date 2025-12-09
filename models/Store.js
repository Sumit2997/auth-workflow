const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    flashcard: {
      type: mongoose.Schema.ObjectId,
      ref: "flashcard",
      required: true,
    },
  },
  { timestamps: true }
);
ReviewSchema.index({ flashcard: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (flashcardId) {
  const result = await this.aggregate([
    { $match: { flashcard: flashcardId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model("flashcard").findOneAndUpdate(
      { _id: flashcardId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.flashcard);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.flashcard);
});

module.exports = mongoose.model("Review", ReviewSchema);

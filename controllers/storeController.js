const Store = require("../models/Store");
const Product = require("../models/Flashcard");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const createStore = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  const alreadySubmitted = await Store.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted Store for this product"
    );
  }

  req.body.user = req.user.userId;
  const Store = await Store.create(req.body);
  res.status(StatusCodes.CREATED).json({ Store });
};
const getAllStores = async (req, res) => {
  const Stores = await Store.find({}).populate({
    path: "flashcard",
    select: "name company price",
  });

  res.status(StatusCodes.OK).json({ Stores, count: Stores.length });
};
const getSingleStore = async (req, res) => {
  const { id: StoreId } = req.params;

  const Store = await Store.findOne({ _id: StoreId });

  if (!Store) {
    throw new CustomError.NotFoundError(`No Store with id ${StoreId}`);
  }

  res.status(StatusCodes.OK).json({ Store });
};
const updateStore = async (req, res) => {
  const { id: StoreId } = req.params;
  const { rating, title, comment } = req.body;

  const Store = await Store.findOne({ _id: StoreId });

  if (!Store) {
    throw new CustomError.NotFoundError(`No Store with id ${StoreId}`);
  }

  checkPermissions(req.user, Store.user);

  Store.rating = rating;
  Store.title = title;
  Store.comment = comment;

  await Store.save();
  res.status(StatusCodes.OK).json({ Store });
};
const deleteStore = async (req, res) => {
  const { id: StoreId } = req.params;

  const Store = await Store.findOne({ _id: StoreId });

  if (!Store) {
    throw new CustomError.NotFoundError(`No Store with id ${StoreId}`);
  }

  checkPermissions(req.user, Store.user);
  await Store.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Store removed" });
};

const getSingleProductStores = async (req, res) => {
  const { id: productId } = req.params;
  const Stores = await Store.find({ product: productId });
  res.status(StatusCodes.OK).json({ Stores, count: Stores.length });
};

module.exports = {
  createStore,
  getAllStores,
  getSingleStore,
  updateStore,
  deleteStore,
  getSingleProductStores,
};

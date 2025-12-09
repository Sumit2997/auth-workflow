const summary = require('../models/summary');
const Product = require('../models/Flashcard');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

const createsummary = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee'
    );
  }

  let summaryItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id : ${item.product}`
      );
    }
    const { name, price, image, _id } = dbProduct;
    const singlesummaryItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to summary
    summaryItems = [...summaryItems, singlesummaryItem];
    // calculate subtotal
    subtotal += item.amount * price;
  }
  // calculate total
  const total = tax + shippingFee + subtotal;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  });

  const summary = await summary.create({
    summaryItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ summary, clientSecret: summary.clientSecret });
};
const getAllsummarys = async (req, res) => {
  const summarys = await summary.find({});
  res.status(StatusCodes.OK).json({ summarys, count: summarys.length });
};
const getSinglesummary = async (req, res) => {
  const { id: summaryId } = req.params;
  const summary = await summary.findOne({ _id: summaryId });
  if (!summary) {
    throw new CustomError.NotFoundError(`No summary with id : ${summaryId}`);
  }
  checkPermissions(req.user, summary.user);
  res.status(StatusCodes.OK).json({ summary });
};
const getCurrentUsersummarys = async (req, res) => {
  const summarys = await summary.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ summarys, count: summarys.length });
};
const updatesummary = async (req, res) => {
  const { id: summaryId } = req.params;
  const { paymentIntentId } = req.body;

  const summary = await summary.findOne({ _id: summaryId });
  if (!summary) {
    throw new CustomError.NotFoundError(`No summary with id : ${summaryId}`);
  }
  checkPermissions(req.user, summary.user);

  summary.paymentIntentId = paymentIntentId;
  summary.status = 'paid';
  await summary.save();

  res.status(StatusCodes.OK).json({ summary });
};

module.exports = {
  getAllsummarys,
  getSinglesummary,
  getCurrentUsersummarys,
  createsummary,
  updatesummary,
};

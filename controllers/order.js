import { asyncError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { stripe } from "../server.js";
import ErrorHandler from "../utils/error.js";

export const processPayment = asyncError(async (req, res, next) => {
  const { totalAmount } = req.body;

  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    //indian currency
    currency: "inr",
  });

  res.status(200).json({
    success: true,
    client_secret,
  });
});

export const createOrder = asyncError(async (req, res, next) => {
  const {
    shippinInfo,
    orderItems,
    paymentMehotd,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  await Order.create({
    user: req.user._id,
    shippinInfo,
    orderItems,
    paymentMehotd,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  });

  for (let counter = 0; counter < array.length; counter++) {
    let product = await Product.findById(orderItems[counter].product);
    product.stock -= orderItems[counter].quantity;
    await product.save();
  }

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
  });
});

export const getAdminOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getMyOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const processOrder = asyncError(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Preparing") {
    order.orderStatus = "Shipped";
  } else if (order.orderStatus === "Shipped") {
    order.orderStatus = "Delivered";
    order.deliveredAt = new Date(Date.now());
  } else return next(new ErrorHandler("Order Already delivered", 400));

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order processed successfully",
  });
});

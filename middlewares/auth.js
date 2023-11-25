import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncError } from "./error.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  //const token = req.cookies.token

  console.log(req.cookies);

  const { token } =
    req.cookies ||
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"];

  if (!token) {
    return next(new ErrorHandler("Not Logged In", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  console.log(decodedData);

  req.user = await User.findById(decodedData._id);
  next();
});

export const isAdmin = asyncError(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only Admin allowed", 401));
  }

  next();
});

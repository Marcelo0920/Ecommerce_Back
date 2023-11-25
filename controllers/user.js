import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri, sendEmail, sendToken } from "../utils/features.js";
import { cookiesOptions } from "../utils/features.js";
import cloudinary from "cloudinary";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Incorrect Email or Password", 400));
  }

  if (!password || !email) {
    return next(new ErrorHandler("Please enter password or email", 400));
  }

  //Handle ERROR
  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Email or Password", 400));
  }

  sendToken(user, res, `Welcome back ${user.name}`, 200);
});

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, country, city, pinCode } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User Already Exist", 400));
  }

  let avatar = undefined;

  if (req.file) {
    //req file
    const file = getDataUri(req.file);

    //Add Cloundinary here
    const myCLoud = await cloudinary.v2.uploader.upload(file.content);

    avatar = {
      public_id: myCLoud.public_id,
      url: myCLoud.secure_url,
    };
  }

  user = await User.create({
    name,
    email,
    password,
    address,
    country,
    avatar,
    city,
    pinCode,
  });

  sendToken(user, res, `Registered Succesfully`, 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {
  console.log(req.user);
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const logOut = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookiesOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logout succesfully",
    });
});

export const updateprofile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, country, pinCode } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(
      new ErrorHandler("Please Enter Old Password & New Password", 400)
    );
  }

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Old Password"));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed Successfully",
  });
});

export const updatePic = asyncError(async (req, res, next) => {
  console.log(req.user);
  const user = await User.findById(req.user._id);

  //req file
  const file = getDataUri(req.file);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //Add Cloundinary here
  const myCLoud = await cloudinary.v2.uploader.upload(file.content);

  user.avatar = {
    public_id: myCLoud.public_id,
    url: myCLoud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated!!",
  });
});

export const forgotPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("Incorrect Email", 404));
  }

  //max, min 2000, 10000
  const randomNumber = Math.random() * (999999 - 100000) + 100000;

  const otp = Math.floor(randomNumber);
  const otp_expire = 15 * 60 * 1000;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);

  await user.save();

  const message = `Your OTP for reseting password is ${otp}.\n please ignore if you havent requested this`;

  console.log(otp);
  try {
    sendEmail("OTP for reseting password", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email}`,
  });
});

export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new ErrorHandler("Incorrect OTP or has been expired", 400));
  }

  if (!password) {
    return next(new ErrorHandler("Please enter new password", 400));
  }

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed successfully",
  });
});

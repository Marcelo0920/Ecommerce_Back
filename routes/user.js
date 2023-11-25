import express from "express";
import {
  changePassword,
  forgotPassword,
  getMyProfile,
  logOut,
  login,
  resetPassword,
  signup,
  updatePic,
  updateprofile,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", singleUpload, signup);

router.get("/me", isAuthenticated, getMyProfile);

router.get("/logout", isAuthenticated, logOut);

//Updating Routes
router.put("/updateprofile", isAuthenticated, updateprofile);

router.put("/changepassword", isAuthenticated, changePassword);

router.put("/updatepic", isAuthenticated, singleUpload, updatePic);

//Forgot password & Reset Password
router.route("/forgotpassword").post(forgotPassword).put(resetPassword);

export default router;

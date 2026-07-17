import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  demoLogin,
} from "./authController";
import passport from "../../config/passport";

const router = express.Router();

router.post(
  "/register",
  [
    body("fullname").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.post("/logout", logout);
router.post("/demo-login", demoLogin);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", [body("email").isEmail().withMessage("Valid email is required")], forgotPassword);
router.post("/reset-password/:token", [body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")], resetPassword);
router.get("/verify-email/:token", verifyEmail);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

export default router;

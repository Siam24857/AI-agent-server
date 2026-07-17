import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../models";
import config from "../../config/config";
import { sendEmail } from "../../utils/helper";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      provider: "local",
      isVerified: true,
      verificationToken,
    });

    await user.save();

    await sendEmail(
      email,
      "Verify your email",
      `Please click on the link to verify your email: http://localhost:3000/verify/${verificationToken}`
    );

    res.status(201).json({ success: true, message: "User registered successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password!);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    const token = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
    const refreshToken = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: "30d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      maxAge: Number(config.jwt.cookieExpiresIn) * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const demoEmail = "demo@aicareermentor.com";
    let user = await User.findOne({ email: demoEmail }).select("+password");

    if (!user) {
      const hashedPassword = await bcrypt.hash("demo1234", 12);
      user = new User({
        fullname: "Demo Candidate",
        email: demoEmail,
        password: hashedPassword,
        provider: "local",
        isVerified: true,
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB"],
        experience: ["Frontend Developer", "Intern"],
        education: ["B.Tech Computer Science"],
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
    const refreshToken = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: "30d" });

    res.json({
      success: true,
      token,
      refreshToken,
      user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
};

export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
    const token = jwt.sign({ id: decoded.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });

    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Password reset",
      `Please click on the link to reset your password: http://localhost:3000/reset-password/${resetToken}`
    );

    res.json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

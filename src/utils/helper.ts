import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import config from "../config/config";
import { User } from "../models";

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: "30d" });
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    } as any);

    await transporter.sendMail({
      from: config.smtp.user,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Email send error:", (error as Error).message);
  }
};

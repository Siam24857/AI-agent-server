import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import config from "./config/config";
import connectDB from "./database/connection";
import passport from "./config/passport";

import authRoutes from "./controllers/auth";
import userRoutes from "./controllers/user";
import jobRoutes from "./controllers/job";
import chatRoutes from "./controllers/chat";
import resumeRoutes from "./controllers/resume";
import recommendationRoutes from "./controllers/recommendation";
import roadmapRoutes from "./controllers/roadmap";
import interviewRoutes from "./controllers/interview";
import historyRoutes from "./controllers/history";
import dashboardRoutes from "./controllers/dashboard";
import blogRoutes from "./controllers/blog";
import statsRoutes from "./controllers/stats";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/stats", statsRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

connectDB();

if (!process.env.VERCEL) {
  const PORT = config.port || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

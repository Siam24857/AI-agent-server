export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || "7",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  mongoUri:
    process.env.MONGO_URI ||
    "mongodb+srv://username:password@cluster0.mongodb.net/ai-career-mentor?retryWrites=true&w=majority",
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: "models/gemini-2.5-flash",
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
};

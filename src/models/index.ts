import mongoose, { Document as MongooseDocument, Schema, Model } from "mongoose";

export interface IUser extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  password?: string;
  avatar?: string;
  provider: "local" | "google";
  role: "user" | "admin";
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  skills?: string[];
  experience?: string[];
  education?: string[];
  preferences?: mongoose.Types.ObjectId;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String },
    avatar: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    skills: [{ type: String }],
    experience: [{ type: String }],
    education: [{ type: String }],
    preferences: { type: Schema.Types.ObjectId, ref: "UserPreferences" },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export interface IConversation extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  context?: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    context: { type: Schema.Types.ObjectId, ref: "UserContext" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

export const Conversation: Model<IConversation> = mongoose.model<IConversation>("Conversation", ConversationSchema);

export interface IMessage extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  content: string;
  role: "user" | "assistant" | "system";
  sender: string;
  metadata?: {
    tokens?: number;
    model?: string;
    temperature?: number;
  };
  createdAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    content: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], default: "user" },
    sender: { type: String, required: true },
    metadata: {
      tokens: { type: Number },
      model: { type: String },
      temperature: { type: Number },
    },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);

export interface IResumeAnalysis extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalUrl: string;
  analysis: {
    score: number;
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    suggestions: string[];
    keywordScore: number;
    readabilityScore: number;
    formattingIssues: string[];
    contentIssues: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    originalUrl: { type: String, required: true },
    analysis: {
      score: { type: Number, default: 0 },
      atsScore: { type: Number, default: 0 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      missingSkills: [{ type: String }],
      suggestions: [{ type: String }],
      keywordScore: { type: Number, default: 0 },
      readabilityScore: { type: Number, default: 0 },
      formattingIssues: [{ type: String }],
      contentIssues: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const ResumeAnalysis: Model<IResumeAnalysis> = mongoose.model<IResumeAnalysis>("ResumeAnalysis", ResumeAnalysisSchema);

export interface ICareerPlan extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  currentRole?: string;
  targetRole?: string;
  plan: {
    currentSkills: string[];
    requiredSkills: string[];
    gaps: string[];
    learningPath: any[];
    timeline: string;
    milestones: any[];
    resources: any[];
  };
  status: "active" | "completed" | "archived";
  createdAt?: Date;
  updatedAt?: Date;
}

const CareerPlanSchema = new Schema<ICareerPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    currentRole: { type: String },
    targetRole: { type: String },
    plan: {
      currentSkills: [{ type: String }],
      requiredSkills: [{ type: String }],
      gaps: [{ type: String }],
      learningPath: { type: Schema.Types.Mixed },
      timeline: { type: String },
      milestones: { type: Schema.Types.Mixed },
      resources: { type: Schema.Types.Mixed },
    },
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  },
  { timestamps: true }
);

export const CareerPlan: Model<ICareerPlan> = mongoose.model<ICareerPlan>("CareerPlan", CareerPlanSchema);

export interface ILearningRoadmap extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  weekPlan: any;
  currentWeek: number;
  status: "active" | "completed" | "archived";
  createdAt?: Date;
  updatedAt?: Date;
}

const LearningRoadmapSchema = new Schema<ILearningRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    weekPlan: { type: Schema.Types.Mixed },
    currentWeek: { type: Number, default: 1 },
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  },
  { timestamps: true }
);

export const LearningRoadmap: Model<ILearningRoadmap> = mongoose.model<ILearningRoadmap>("LearningRoadmap", LearningRoadmapSchema);

export interface IJobRecommendation extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  title: string;
  company?: string;
  location?: string;
  type: "job" | "course" | "project";
  matchScore: number;
  matchReason: string;
  source?: string;
  url?: string;
  requirements?: string[];
  benefits?: string[];
  salary?: string;
  experience?: string;
  createdAt?: Date;
}

const JobRecommendationSchema = new Schema<IJobRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    title: { type: String, required: true, trim: true },
    company: { type: String },
    location: { type: String },
    type: { type: String, enum: ["job", "course", "project"], required: true },
    matchScore: { type: Number, required: true, default: 0 },
    matchReason: { type: String, required: true },
    source: { type: String },
    url: { type: String },
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    salary: { type: String },
    experience: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const JobRecommendation: Model<IJobRecommendation> = mongoose.model<IJobRecommendation>("JobRecommendation", JobRecommendationSchema);

export interface ISavedJob extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  remote: boolean;
  deadline?: Date;
  notes?: string;
  status: "saved" | "applied" | "interviewed" | "rejected";
  createdAt?: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    experience: { type: String, required: true },
    salary: { type: String, required: true },
    remote: { type: Boolean, default: false },
    deadline: { type: Date },
    notes: { type: String },
    status: { type: String, enum: ["saved", "applied", "interviewed", "rejected"], default: "saved" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SavedJob: Model<ISavedJob> = mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);

export interface IActivityLog extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId: mongoose.Types.ObjectId;
  details: Schema.Types.Mixed;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export interface IDocument extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  url: string;
  publicId: string;
  type: "resume" | "cv" | "portfolio" | "certificate";
  size: number;
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["resume", "cv", "portfolio", "certificate"], required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Document: Model<IDocument> = mongoose.model<IDocument>("Document", DocumentSchema);

export interface INotification extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string;
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false },
    actionUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.model<INotification>("Notification", NotificationSchema);

export interface IJob extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  experience: "entry" | "mid" | "senior" | "executive";
  salary: string;
  remote: boolean;
  category: string;
  skills: string[];
  deadline: Date;
  postedBy: mongoose.Types.ObjectId;
  status: "active" | "closed";
  applications?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    location: { type: String, required: true },
    type: { type: String, enum: ["full-time", "part-time", "contract", "internship"], default: "full-time" },
    experience: { type: String, enum: ["entry", "mid", "senior", "executive"], default: "entry" },
    salary: { type: String, required: true },
    remote: { type: Boolean, default: false },
    category: { type: String, required: true },
    skills: [{ type: String }],
    deadline: { type: Date, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    applications: [{ type: Schema.Types.ObjectId, ref: "Application" }],
  },
  { timestamps: true }
);

export const Job: Model<IJob> = mongoose.model<IJob>("Job", JobSchema);

export interface IApplication extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  coverLetter?: string;
  resumeUrl: string;
  status: "pending" | "reviewed" | "interviewed" | "rejected" | "accepted";
  appliedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String },
    resumeUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed", "interviewed", "rejected", "accepted"], default: "pending" },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Application: Model<IApplication> = mongoose.model<IApplication>("Application", ApplicationSchema);

export interface IBlogPost extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const BlogPost: Model<IBlogPost> = mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export const UserPreferences = mongoose.model("UserPreferences", new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  notifications: { type: Boolean, default: true },
  emailDigest: { type: Boolean, default: false },
  aiTips: { type: Boolean, default: true },
}, { timestamps: true }));

export const UserContext = mongoose.model("UserContext", new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  context: { type: Schema.Types.Mixed },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true }));

export interface IUserActivity {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserActivity = mongoose.model<IUserActivity>("UserActivity", UserActivitySchema);

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import config from "../config/config";
import { Job, BlogPost, User } from "../models";

const JOBS = [
  {
    title: "Frontend Engineer",
    company: "NovaTech Solutions",
    description:
      "Join our product team to build responsive, accessible web applications using React and TypeScript. You will collaborate with designers and backend engineers to ship features used by thousands of users daily.",
    requirements: ["React", "TypeScript", "CSS/Tailwind", "REST APIs", "Git"],
    benefits: ["Health insurance", "Remote-friendly", "Learning budget", "Flexible hours"],
    location: "Bengaluru, India",
    type: "full-time",
    experience: "mid",
    salary: "₹12L – ₹18L PA",
    remote: true,
    category: "Engineering",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  },
  {
    title: "Data Scientist",
    company: "Quanta Analytics",
    description:
      "Build machine learning models that power real-time decision systems. Work with large datasets, design experiments, and communicate insights to non-technical stakeholders.",
    requirements: ["Python", "Machine Learning", "SQL", "Statistics", "Pandas"],
    benefits: ["Bonus", "Hybrid work", "Conference sponsorship"],
    location: "Hyderabad, India",
    type: "full-time",
    experience: "senior",
    salary: "₹18L – ₹28L PA",
    remote: false,
    category: "Data",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
  },
  {
    title: "UX/UI Designer",
    company: "Lumen Studio",
    description:
      "Design intuitive product experiences from research to high-fidelity prototypes. Partner with engineering to ensure pixel-perfect implementation.",
    requirements: ["Figma", "User Research", "Design Systems", "Prototyping"],
    benefits: ["Creative freedom", "Remote", "Design tools budget"],
    location: "Remote",
    type: "contract",
    experience: "mid",
    salary: "₹10L – ₹15L PA",
    remote: true,
    category: "Design",
    skills: ["Figma", "User Research", "Design Systems"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
  },
  {
    title: "Backend Developer (Node.js)",
    company: "Orbit Systems",
    description:
      "Design and maintain scalable REST and GraphQL APIs. Own services end-to-end including databases, caching, and observability.",
    requirements: ["Node.js", "Express", "MongoDB", "Redis", "Docker"],
    benefits: ["ESOP", "Health cover", "Flexible PTO"],
    location: "Pune, India",
    type: "full-time",
    experience: "mid",
    salary: "₹11L – ₹16L PA",
    remote: false,
    category: "Engineering",
    skills: ["Node.js", "Express", "MongoDB", "Docker"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
  },
  {
    title: "AI/ML Engineer Intern",
    company: "Synapse Labs",
    description:
      "Work alongside senior researchers on LLM fine-tuning, evaluation, and deployment. Great opportunity to learn production AI systems.",
    requirements: ["Python", "PyTorch", "Curiosity", "Basic ML"],
    benefits: ["Mentorship", "Stipend", "PPO opportunity"],
    location: "Bengaluru, India",
    type: "internship",
    experience: "entry",
    salary: "₹25K – ₹40K / month",
    remote: true,
    category: "Data",
    skills: ["Python", "PyTorch", "Machine Learning"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
  },
  {
    title: "DevOps Engineer",
    company: "CloudPeak",
    description:
      "Automate infrastructure, improve CI/CD pipelines, and maintain Kubernetes clusters. Drive reliability and cost efficiency.",
    requirements: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
    benefits: ["On-call premium", "Remote", "Certifications"],
    location: "Mumbai, India",
    type: "full-time",
    experience: "senior",
    salary: "₹20L – ₹30L PA",
    remote: false,
    category: "Engineering",
    skills: ["Kubernetes", "AWS", "Terraform", "Docker"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
  },
  {
    title: "Product Manager",
    company: "BrightPath",
    description:
      "Own the product roadmap, gather requirements, and align engineering and design toward measurable outcomes.",
    requirements: ["Roadmapping", "Analytics", "Stakeholder mgmt", "SQL basics"],
    benefits: ["Leadership track", "Hybrid", "Bonus"],
    location: "Delhi, India",
    type: "full-time",
    experience: "senior",
    salary: "₹22L – ₹32L PA",
    remote: false,
    category: "Product",
    skills: ["Product Strategy", "Analytics", "Roadmapping"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22),
  },
  {
    title: "Technical Writer",
    company: "DocuCraft",
    description:
      "Create clear documentation, tutorials, and API references for developer products. Translate complex concepts for broad audiences.",
    requirements: ["Technical writing", "Markdown", "APIs", "Attention to detail"],
    benefits: ["Remote", "Flexible hours", "Course budget"],
    location: "Remote",
    type: "part-time",
    experience: "mid",
    salary: "₹6L – ₹10L PA",
    remote: true,
    category: "Content",
    skills: ["Technical Writing", "Markdown", "APIs"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
  },
  {
    title: "Mobile App Developer (Flutter)",
    company: "Pixelforge",
    description:
      "Build cross-platform mobile apps with Flutter. Deliver smooth, performant experiences across iOS and Android.",
    requirements: ["Flutter", "Dart", "REST", "Firebase"],
    benefits: ["Remote", "Creative projects", "Health cover"],
    location: "Chennai, India",
    type: "full-time",
    experience: "mid",
    salary: "₹10L – ₹15L PA",
    remote: true,
    category: "Engineering",
    skills: ["Flutter", "Dart", "Firebase"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27),
  },
  {
    title: "Cybersecurity Analyst",
    company: "SentinelSec",
    description:
      "Monitor threats, perform vulnerability assessments, and respond to incidents. Help keep customer data safe.",
    requirements: ["Network security", "SIEM", "Incident response", "Linux"],
    benefits: ["Certifications", "Hybrid", "Bonus"],
    location: "Hyderabad, India",
    type: "full-time",
    experience: "senior",
    salary: "₹16L – ₹24L PA",
    remote: false,
    category: "Security",
    skills: ["Network Security", "SIEM", "Incident Response"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 33),
  },
  {
    title: "QA Automation Engineer",
    company: "TestGrid",
    description:
      "Design and maintain automated test suites. Collaborate with dev to shift quality left in the pipeline.",
    requirements: ["Selenium", "Playwright", "JavaScript", "CI"],
    benefits: ["Remote", "Learning budget"],
    location: "Remote",
    type: "full-time",
    experience: "entry",
    salary: "₹7L – ₹11L PA",
    remote: true,
    category: "Engineering",
    skills: ["Selenium", "Playwright", "JavaScript"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 19),
  },
  {
    title: "Growth Marketing Manager",
    company: "Upwardly",
    description:
      "Lead acquisition campaigns across channels, own funnel metrics, and run experiments to grow active users.",
    requirements: ["SEO", "Paid ads", "Analytics", "Copywriting"],
    benefits: ["Hybrid", "Bonus", "Creative ownership"],
    location: "Mumbai, India",
    type: "full-time",
    experience: "mid",
    salary: "₹12L – ₹18L PA",
    remote: false,
    category: "Marketing",
    skills: ["SEO", "Google Ads", "Analytics"],
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 24),
  },
];

const BLOGS = [
  {
    title: "How to Write a Resume That Passes ATS in 2026",
    excerpt:
      "Applicant Tracking Systems reject up to 75% of resumes. Learn the formatting, keywords, and structure that get you seen by humans.",
    content: `Most large companies use Applicant Tracking Systems (ATS) to filter resumes before a recruiter ever reads them.

Key principles:
1. Use a clean, single-column layout with standard section headings.
2. Mirror the exact keywords from the job description.
3. Include measurable achievements, not just responsibilities.
4. Avoid images, tables, and fancy graphics that parsers choke on.
5. Save and submit as a standard PDF.

Our AI Resume Analyzer scores your document on ATS compatibility, keyword use, and readability, then gives concrete fixes.`,
    category: "Career Tips",
    tags: ["resume", "ATS", "job search"],
    status: "published",
  },
  {
    title: "5 AI Tools That Actually Help You Prepare for Interviews",
    excerpt:
      "From mock interview bots to real-time feedback, here are the AI assistants worth your time before the big day.",
    content: `Interview prep has changed. Instead of static question lists, you can now practice with AI that evaluates your answers.

Use cases:
- Generate role-specific questions and evaluate your responses.
- Get feedback on clarity, structure, and missing points.
- Simulate behavioral and HR rounds with follow-ups.

The AI Career Mentor interview practice module does exactly this, with scoring and model answers.`,
    category: "Interview Prep",
    tags: ["interview", "AI", "practice"],
    status: "published",
  },
  {
    title: "Building a 6-Month Learning Roadmap That Sticks",
    excerpt:
      "A personalized roadmap beats generic courses. Here is how to plan, execute, and track a skill-building sprint.",
    content: `Consistency beats intensity. A good roadmap has clear weekly objectives, real projects, and milestones.

Steps:
1. Identify your target role and the required skills gap.
2. Break the gap into 8-12 weekly sprints.
3. Mix courses, docs, and hands-on projects.
4. Review milestones and adjust monthly.

Our roadmap generator builds this from your profile and goal automatically.`,
    category: "Skill Growth",
    tags: ["learning", "roadmap", "skills"],
    status: "published",
  },
];

async function run() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  let admin = await User.findOne({ email: "demo@aicareermentor.com" });
  if (!admin) {
    const hashed = await bcrypt.hash("demo1234", 12);
    admin = await User.create({
      fullname: "Demo Candidate",
      email: "demo@aicareermentor.com",
      password: hashed,
      provider: "local",
      isVerified: true,
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB"],
      experience: ["Frontend Developer", "Intern"],
      education: ["B.Tech Computer Science"],
    });
    console.log("Created demo user");
  }
  const authorId = admin._id;

  await Job.deleteMany({});
  for (const j of JOBS) {
    await Job.create({ ...j, postedBy: authorId, status: "active" });
  }
  console.log(`Seeded ${JOBS.length} jobs`);

  await BlogPost.deleteMany({});
  for (const b of BLOGS) {
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await BlogPost.create({
      ...b,
      slug,
      author: authorId,
      publishedAt: new Date(),
    });
  }
  console.log(`Seeded ${BLOGS.length} blog posts`);

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

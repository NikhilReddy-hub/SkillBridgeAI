/**
 * SkillBridge AI — MongoDB Seed Script
 * 
 * Seeds the database with:
 *  - 2 Admin users + 5 Student users
 *  - 30+ skills across categories
 *  - 12 Job Roles with required skills
 *  - 20+ Learning Resources
 * 
 * Usage: npm run seed
 * WARNING: Clears all existing data before seeding.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Skill = require('../models/Skill');
const JobRole = require('../models/JobRole');
const LearningResource = require('../models/LearningResource');
const UserSkill = require('../models/UserSkill');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const Progress = require('../models/Progress');

const connectDB = require('../config/db');

// ─── Skill Data ───────────────────────────────────────────────────────────────
const skillsData = [
  // Programming Languages
  { name: 'JavaScript', category: 'Programming Language', difficulty: 'beginner', estimatedHours: 80, priorityScore: 95, icon: '🟨', description: 'Core language of the web. Essential for frontend and backend development.' },
  { name: 'TypeScript', category: 'Programming Language', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 88, icon: '🔷', description: 'Typed superset of JavaScript. Industry standard for large-scale apps.' },
  { name: 'Python', category: 'Programming Language', difficulty: 'beginner', estimatedHours: 60, priorityScore: 92, icon: '🐍', description: 'Versatile language for AI/ML, data science, and backend development.' },
  { name: 'Java', category: 'Programming Language', difficulty: 'intermediate', estimatedHours: 100, priorityScore: 80, icon: '☕', description: 'Enterprise-grade language for backend systems and Android development.' },
  { name: 'C++', category: 'Programming Language', difficulty: 'advanced', estimatedHours: 120, priorityScore: 70, icon: '⚙️', description: 'High-performance language for systems programming and competitive coding.' },
  { name: 'Go (Golang)', category: 'Programming Language', difficulty: 'intermediate', estimatedHours: 60, priorityScore: 75, icon: '🐹', description: 'Fast, concurrent language used in cloud-native and microservices.' },
  { name: 'Rust', category: 'Programming Language', difficulty: 'advanced', estimatedHours: 100, priorityScore: 65, icon: '🦀', description: 'Memory-safe systems programming language.' },
  { name: 'Kotlin', category: 'Programming Language', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 72, icon: '🅺', description: 'Modern JVM language, primary for Android development.' },
  { name: 'Swift', category: 'Programming Language', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 68, icon: '🍎', description: 'Apple ecosystem language for iOS and macOS apps.' },

  // Frameworks
  { name: 'React.js', category: 'Framework', difficulty: 'intermediate', estimatedHours: 60, priorityScore: 95, icon: '⚛️', description: 'Most popular frontend UI library.' },
  { name: 'Node.js', category: 'Framework', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 90, icon: '🟢', description: 'JavaScript runtime for server-side applications.' },
  { name: 'Next.js', category: 'Framework', difficulty: 'intermediate', estimatedHours: 40, priorityScore: 88, icon: '▲', description: 'React framework for production-grade web apps.' },
  { name: 'Express.js', category: 'Framework', difficulty: 'beginner', estimatedHours: 30, priorityScore: 85, icon: '🛣️', description: 'Minimal, fast Node.js web framework.' },
  { name: 'Vue.js', category: 'Framework', difficulty: 'intermediate', estimatedHours: 40, priorityScore: 78, icon: '💚', description: 'Progressive JavaScript framework for web UIs.' },
  { name: 'Django', category: 'Framework', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 80, icon: '🎸', description: 'High-level Python web framework.' },
  { name: 'Spring Boot', category: 'Framework', difficulty: 'advanced', estimatedHours: 80, priorityScore: 78, icon: '🍃', description: 'Production-ready Java application framework.' },
  { name: 'FastAPI', category: 'Framework', difficulty: 'intermediate', estimatedHours: 30, priorityScore: 82, icon: '⚡', description: 'Modern, fast Python web framework for APIs.' },
  { name: 'Flutter', category: 'Framework', difficulty: 'intermediate', estimatedHours: 60, priorityScore: 75, icon: '🦋', description: 'Google UI toolkit for cross-platform apps.' },
  { name: 'React Native', category: 'Framework', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 72, icon: '📱', description: 'Build native mobile apps using React.' },

  // Databases
  { name: 'MongoDB', category: 'Database', difficulty: 'beginner', estimatedHours: 30, priorityScore: 85, icon: '🍃', description: 'NoSQL document database. Popular for Node.js apps.' },
  { name: 'PostgreSQL', category: 'Database', difficulty: 'intermediate', estimatedHours: 40, priorityScore: 88, icon: '🐘', description: 'Advanced open-source relational database.' },
  { name: 'MySQL', category: 'Database', difficulty: 'beginner', estimatedHours: 35, priorityScore: 80, icon: '🐬', description: 'World\'s most popular open-source relational database.' },
  { name: 'Redis', category: 'Database', difficulty: 'intermediate', estimatedHours: 25, priorityScore: 82, icon: '🔴', description: 'In-memory data store for caching and sessions.' },

  // Cloud
  { name: 'AWS', category: 'Cloud', difficulty: 'intermediate', estimatedHours: 80, priorityScore: 90, icon: '☁️', description: 'Amazon Web Services — world\'s leading cloud platform.' },
  { name: 'Google Cloud (GCP)', category: 'Cloud', difficulty: 'intermediate', estimatedHours: 70, priorityScore: 82, icon: '🌤️', description: 'Google\'s cloud computing services.' },
  { name: 'Azure', category: 'Cloud', difficulty: 'intermediate', estimatedHours: 70, priorityScore: 80, icon: '🔵', description: 'Microsoft\'s cloud computing platform.' },

  // DevOps
  { name: 'Docker', category: 'DevOps', difficulty: 'intermediate', estimatedHours: 30, priorityScore: 88, icon: '🐳', description: 'Container platform for consistent deployment.' },
  { name: 'Kubernetes', category: 'DevOps', difficulty: 'advanced', estimatedHours: 60, priorityScore: 85, icon: '☸️', description: 'Container orchestration system.' },
  { name: 'Git', category: 'Tool', difficulty: 'beginner', estimatedHours: 20, priorityScore: 95, icon: '📝', description: 'Version control system. Essential for all developers.' },
  { name: 'CI/CD (GitHub Actions)', category: 'DevOps', difficulty: 'intermediate', estimatedHours: 30, priorityScore: 80, icon: '🔄', description: 'Automated build, test, and deploy pipelines.' },

  // AI/ML
  { name: 'Machine Learning', category: 'AI/ML', difficulty: 'intermediate', estimatedHours: 100, priorityScore: 85, icon: '🤖', description: 'Algorithms that learn from data.' },
  { name: 'TensorFlow', category: 'AI/ML', difficulty: 'advanced', estimatedHours: 60, priorityScore: 78, icon: '🧠', description: 'Google\'s end-to-end ML platform.' },
  { name: 'PyTorch', category: 'AI/ML', difficulty: 'advanced', estimatedHours: 60, priorityScore: 80, icon: '🔥', description: 'Facebook\'s ML framework, popular for research.' },
  { name: 'Pandas', category: 'AI/ML', difficulty: 'beginner', estimatedHours: 30, priorityScore: 85, icon: '🐼', description: 'Python data analysis and manipulation library.' },
  { name: 'NumPy', category: 'AI/ML', difficulty: 'beginner', estimatedHours: 20, priorityScore: 82, icon: '🔢', description: 'Fundamental scientific computing library for Python.' },

  // Soft Skills
  { name: 'Problem Solving', category: 'Soft Skill', difficulty: 'beginner', estimatedHours: 50, priorityScore: 95, icon: '🧩', description: 'Ability to analyze and solve complex technical problems.' },
  { name: 'Communication', category: 'Soft Skill', difficulty: 'beginner', estimatedHours: 30, priorityScore: 90, icon: '💬', description: 'Clear technical and non-technical communication.' },
  { name: 'Data Structures & Algorithms', category: 'Tool', difficulty: 'intermediate', estimatedHours: 120, priorityScore: 92, icon: '🏗️', description: 'Foundation of computer science. Essential for technical interviews.' },

  // Security
  { name: 'OWASP Top 10', category: 'Cyber Security', difficulty: 'intermediate', estimatedHours: 30, priorityScore: 82, icon: '🔒', description: 'Top 10 web application security vulnerabilities.' },
  { name: 'Network Security', category: 'Cyber Security', difficulty: 'intermediate', estimatedHours: 50, priorityScore: 78, icon: '🛡️', description: 'Securing computer networks from attacks.' },
];

// ─── Job Roles Data ───────────────────────────────────────────────────────────
const jobRolesData = [
  {
    title: 'Frontend Developer',
    description: 'Build user interfaces and experiences using modern web technologies.',
    icon: '🎨',
    category: 'Development',
    demandLevel: 'very-high',
    averageSalary: { entry: '4-7 LPA', mid: '8-18 LPA', senior: '20-40 LPA' },
    interviewTopics: ['HTML/CSS', 'JavaScript ES6+', 'React fundamentals', 'State management', 'REST APIs', 'Performance optimization', 'Responsive design'],
    commonCompanies: ['Google', 'Meta', 'Amazon', 'Flipkart', 'Swiggy', 'Razorpay', 'Paytm'],
    requiredSkillNames: ['JavaScript', 'React.js', 'TypeScript', 'Git', 'Problem Solving'],
  },
  {
    title: 'Backend Developer',
    description: 'Design and build server-side applications, APIs, and databases.',
    icon: '⚙️',
    category: 'Development',
    demandLevel: 'very-high',
    averageSalary: { entry: '5-8 LPA', mid: '10-20 LPA', senior: '22-45 LPA' },
    interviewTopics: ['RESTful API design', 'Database design', 'Authentication', 'Caching', 'Microservices', 'SQL/NoSQL', 'System design basics'],
    commonCompanies: ['Amazon', 'Microsoft', 'Oracle', 'Infosys', 'TCS', 'Atlassian'],
    requiredSkillNames: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Git', 'Data Structures & Algorithms'],
  },
  {
    title: 'Full Stack Developer',
    description: 'Work across the entire stack — frontend, backend, and database.',
    icon: '🌐',
    category: 'Development',
    demandLevel: 'very-high',
    averageSalary: { entry: '5-9 LPA', mid: '12-25 LPA', senior: '25-50 LPA' },
    interviewTopics: ['React + Node.js', 'Database design', 'APIs', 'Auth', 'Deployment', 'System design'],
    commonCompanies: ['Startups', 'Razorpay', 'Zepto', 'CRED', 'Groww', 'Meesho'],
    requiredSkillNames: ['JavaScript', 'React.js', 'Node.js', 'MongoDB', 'Git', 'TypeScript'],
  },
  {
    title: 'Data Analyst',
    description: 'Analyze data to extract insights and support business decisions.',
    icon: '📊',
    category: 'Data',
    demandLevel: 'high',
    averageSalary: { entry: '4-6 LPA', mid: '7-15 LPA', senior: '16-35 LPA' },
    interviewTopics: ['SQL queries', 'Python/Pandas', 'Excel', 'Data visualization', 'Statistics', 'Business intelligence'],
    commonCompanies: ['Deloitte', 'KPMG', 'Mu Sigma', 'Fractal Analytics', 'Tiger Analytics'],
    requiredSkillNames: ['Python', 'Pandas', 'NumPy', 'MySQL', 'PostgreSQL', 'Communication'],
  },
  {
    title: 'Data Scientist',
    description: 'Build ML models and derive actionable insights from complex datasets.',
    icon: '🔬',
    category: 'Data',
    demandLevel: 'high',
    averageSalary: { entry: '6-10 LPA', mid: '12-22 LPA', senior: '25-60 LPA' },
    interviewTopics: ['ML algorithms', 'Statistics', 'Python', 'Feature engineering', 'Model evaluation', 'Deep learning'],
    commonCompanies: ['Amazon', 'Flipkart', 'Ola', 'PhonePe', 'Google', 'Microsoft'],
    requiredSkillNames: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'PostgreSQL'],
  },
  {
    title: 'DevOps Engineer',
    description: 'Bridge development and operations — automate deployment pipelines.',
    icon: '🔧',
    category: 'Development',
    demandLevel: 'very-high',
    averageSalary: { entry: '5-8 LPA', mid: '12-22 LPA', senior: '24-50 LPA' },
    interviewTopics: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Cloud platforms', 'Monitoring', 'Infrastructure as Code'],
    commonCompanies: ['AWS', 'Google', 'Atlassian', 'Razorpay', 'Freshworks', 'Zoho'],
    requiredSkillNames: ['Docker', 'Kubernetes', 'AWS', 'CI/CD (GitHub Actions)', 'Git', 'Go (Golang)'],
  },
  {
    title: 'Cloud Engineer',
    description: 'Design, build and maintain cloud infrastructure at scale.',
    icon: '☁️',
    category: 'Cloud',
    demandLevel: 'very-high',
    averageSalary: { entry: '6-9 LPA', mid: '12-24 LPA', senior: '25-55 LPA' },
    interviewTopics: ['AWS/GCP/Azure services', 'VPC/networking', 'IAM', 'Serverless', 'Cost optimization', 'IaC'],
    commonCompanies: ['AWS', 'Google', 'Microsoft', 'Accenture', 'Wipro', 'HCL'],
    requiredSkillNames: ['AWS', 'Docker', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Go (Golang)'],
  },
  {
    title: 'AI Engineer',
    description: 'Build and deploy production AI systems and LLM applications.',
    icon: '🤖',
    category: 'AI/ML',
    demandLevel: 'very-high',
    averageSalary: { entry: '8-14 LPA', mid: '18-35 LPA', senior: '40-100 LPA' },
    interviewTopics: ['LLMs', 'Prompt engineering', 'RAG systems', 'ML pipelines', 'Vector databases', 'Fine-tuning'],
    commonCompanies: ['Google', 'OpenAI', 'Microsoft', 'Amazon', 'Sarvam AI', 'Krutrim'],
    requiredSkillNames: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'FastAPI'],
  },
  {
    title: 'Java Developer',
    description: 'Build enterprise-grade backend systems and microservices using Java.',
    icon: '☕',
    category: 'Development',
    demandLevel: 'high',
    averageSalary: { entry: '4-7 LPA', mid: '9-18 LPA', senior: '20-40 LPA' },
    interviewTopics: ['Java OOP', 'Spring Boot', 'Hibernate', 'Microservices', 'JVM internals', 'DSA in Java'],
    commonCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Oracle', 'Goldman Sachs'],
    requiredSkillNames: ['Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'Data Structures & Algorithms', 'Docker'],
  },
  {
    title: 'Python Developer',
    description: 'Build web apps, automation scripts, and data pipelines using Python.',
    icon: '🐍',
    category: 'Development',
    demandLevel: 'high',
    averageSalary: { entry: '4-7 LPA', mid: '9-18 LPA', senior: '20-40 LPA' },
    interviewTopics: ['Python fundamentals', 'Django/FastAPI', 'Async programming', 'Testing', 'Databases', 'APIs'],
    commonCompanies: ['Druva', 'Freshworks', 'Hasura', 'Setu', 'Clear (formerly Cleartax)'],
    requiredSkillNames: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    title: 'Cyber Security',
    description: 'Protect systems, networks, and data from digital attacks.',
    icon: '🛡️',
    category: 'Security',
    demandLevel: 'high',
    averageSalary: { entry: '5-8 LPA', mid: '10-22 LPA', senior: '24-50 LPA' },
    interviewTopics: ['OWASP', 'Penetration testing', 'Network security', 'Cryptography', 'SOC operations', 'Incident response'],
    commonCompanies: ['Palo Alto', 'Crowdstrike', 'Quick Heal', 'Wipro CyberSecurity', 'TCS'],
    requiredSkillNames: ['OWASP Top 10', 'Network Security', 'Python', 'Linux'],
  },
  {
    title: 'Mobile Developer',
    description: 'Build native or cross-platform mobile apps for iOS and Android.',
    icon: '📱',
    category: 'Mobile',
    demandLevel: 'high',
    averageSalary: { entry: '4-7 LPA', mid: '10-20 LPA', senior: '22-45 LPA' },
    interviewTopics: ['Flutter/React Native', 'Native APIs', 'State management', 'App performance', 'Push notifications', 'App store deployment'],
    commonCompanies: ['PhonePe', 'Zepto', 'Swiggy', 'Ola', 'MakeMyTrip', 'Dream11'],
    requiredSkillNames: ['Flutter', 'React Native', 'Kotlin', 'Swift', 'Git'],
  },
];

// ─── Learning Resources Data ──────────────────────────────────────────────────
const resourcesData = [
  { title: 'MDN Web Docs — JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'documentation', provider: 'MDN', difficulty: 'beginner', estimatedHours: 20, skillNames: ['JavaScript'], isFree: true },
  { title: 'The Odin Project — Full Stack', url: 'https://www.theodinproject.com', type: 'course', provider: 'The Odin Project', difficulty: 'beginner', estimatedHours: 200, isFree: true },
  { title: 'freeCodeCamp — Responsive Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'course', provider: 'freeCodeCamp', difficulty: 'beginner', estimatedHours: 30, isFree: true },
  { title: 'React Official Documentation', url: 'https://react.dev', type: 'documentation', provider: 'Meta', difficulty: 'intermediate', estimatedHours: 15, skillNames: ['React.js'], isFree: true },
  { title: 'JavaScript Algorithms and Data Structures — freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course', provider: 'freeCodeCamp', difficulty: 'intermediate', estimatedHours: 60, skillNames: ['JavaScript', 'Data Structures & Algorithms'], isFree: true },
  { title: 'Python for Everybody — Coursera', url: 'https://www.coursera.org/specializations/python', type: 'course', provider: 'Coursera', difficulty: 'beginner', estimatedHours: 80, skillNames: ['Python'], isPremium: true, isFree: false },
  { title: 'CS50x — Introduction to Computer Science', url: 'https://cs50.harvard.edu/x/', type: 'course', provider: 'Harvard', difficulty: 'beginner', estimatedHours: 100, isFree: true },
  { title: 'NeetCode — DSA Practice', url: 'https://neetcode.io', type: 'practice', provider: 'NeetCode', difficulty: 'intermediate', estimatedHours: 100, skillNames: ['Data Structures & Algorithms'], isFree: true },
  { title: 'LeetCode', url: 'https://leetcode.com', type: 'practice', provider: 'LeetCode', difficulty: 'intermediate', estimatedHours: 200, skillNames: ['Data Structures & Algorithms', 'Problem Solving'], isFree: true },
  { title: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started/', type: 'documentation', provider: 'Docker', difficulty: 'beginner', estimatedHours: 10, skillNames: ['Docker'], isFree: true },
  { title: 'Kubernetes Basics — Official Tutorial', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', type: 'documentation', provider: 'CNCF', difficulty: 'intermediate', estimatedHours: 20, skillNames: ['Kubernetes'], isFree: true },
  { title: 'AWS Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/learn-about/cloud-practitioner/', type: 'course', provider: 'AWS', difficulty: 'beginner', estimatedHours: 15, skillNames: ['AWS'], isFree: true },
  { title: 'Machine Learning Specialization — Andrew Ng', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'course', provider: 'Coursera / Stanford', difficulty: 'intermediate', estimatedHours: 90, skillNames: ['Machine Learning'], isPremium: true, isFree: false },
  { title: 'Fast.ai — Practical Deep Learning', url: 'https://course.fast.ai', type: 'course', provider: 'fast.ai', difficulty: 'intermediate', estimatedHours: 50, skillNames: ['Machine Learning', 'PyTorch'], isFree: true },
  { title: 'MongoDB University', url: 'https://learn.mongodb.com', type: 'course', provider: 'MongoDB', difficulty: 'beginner', estimatedHours: 20, skillNames: ['MongoDB'], isFree: true },
  { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', type: 'documentation', provider: 'PostgreSQL Tutorial', difficulty: 'beginner', estimatedHours: 15, skillNames: ['PostgreSQL'], isFree: true },
  { title: 'Traversy Media — React Crash Course', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', type: 'youtube', provider: 'YouTube', difficulty: 'beginner', estimatedHours: 2, skillNames: ['React.js'], isFree: true },
  { title: 'Fireship.io — 100 Seconds Videos', url: 'https://www.youtube.com/@Fireship', type: 'youtube', provider: 'YouTube', difficulty: 'beginner', estimatedHours: 5, isFree: true },
  { title: 'Spring Boot Tutorial — Amigoscode', url: 'https://www.youtube.com/watch?v=9SGDpanrc8U', type: 'youtube', provider: 'YouTube', difficulty: 'intermediate', estimatedHours: 5, skillNames: ['Spring Boot'], isFree: true },
  { title: 'OWASP Top 10 Official Guide', url: 'https://owasp.org/www-project-top-ten/', type: 'documentation', provider: 'OWASP', difficulty: 'intermediate', estimatedHours: 10, skillNames: ['OWASP Top 10'], isFree: true },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');

    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      JobRole.deleteMany({}),
      LearningResource.deleteMany({}),
      UserSkill.deleteMany({}),
      Notification.deleteMany({}),
      Achievement.deleteMany({}),
      Progress.deleteMany({}),
    ]);

    console.log('✅ Cleared existing data');

    // ─── Create Admin Users ────────────────────────────────────────────
    console.log('👤 Creating admin users...');
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    const admins = await User.insertMany([
      {
        name: 'Super Admin',
        email: 'admin@skillbridge.ai',
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        profileCompletion: 100,
        college: 'SkillBridge HQ',
      },
      {
        name: 'Content Manager',
        email: 'manager@skillbridge.ai',
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        profileCompletion: 100,
      },
    ]);

    // ─── Create Student Users ──────────────────────────────────────────
    console.log('🎓 Creating student users...');
    const studentPassword = await bcrypt.hash('Student@123', 12);
    const students = await User.insertMany([
      {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: studentPassword,
        role: 'student',
        isVerified: true,
        college: 'IIT Bombay',
        branch: 'Computer Science',
        graduationYear: 2025,
        cgpa: 8.5,
        targetCareer: 'Full Stack Developer',
        experienceLevel: 'intermediate',
        githubProfile: 'https://github.com/aarav-sharma',
        profileCompletion: 85,
        careerReadinessScore: 62,
        totalSkillsAdded: 8,
        streak: 7,
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: studentPassword,
        role: 'student',
        isVerified: true,
        college: 'NIT Surathkal',
        branch: 'Electronics & Communication',
        graduationYear: 2025,
        cgpa: 7.8,
        targetCareer: 'Data Scientist',
        experienceLevel: 'beginner',
        linkedinProfile: 'https://linkedin.com/in/priya-patel',
        profileCompletion: 70,
        careerReadinessScore: 45,
        totalSkillsAdded: 5,
      },
      {
        name: 'Rohan Mehta',
        email: 'rohan@example.com',
        password: studentPassword,
        role: 'student',
        isVerified: true,
        college: 'VIT Vellore',
        branch: 'Information Technology',
        graduationYear: 2026,
        cgpa: 8.2,
        targetCareer: 'DevOps Engineer',
        experienceLevel: 'beginner',
        profileCompletion: 65,
        careerReadinessScore: 38,
        totalSkillsAdded: 4,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        password: studentPassword,
        role: 'student',
        isVerified: true,
        college: 'BITS Pilani',
        branch: 'Computer Science',
        graduationYear: 2025,
        cgpa: 9.0,
        targetCareer: 'AI Engineer',
        experienceLevel: 'intermediate',
        githubProfile: 'https://github.com/sneha-reddy',
        profileCompletion: 90,
        careerReadinessScore: 78,
        totalSkillsAdded: 12,
        streak: 15,
      },
      {
        name: 'Karan Joshi',
        email: 'karan@example.com',
        password: studentPassword,
        role: 'student',
        isVerified: true,
        college: 'SRM Institute',
        branch: 'CSE',
        graduationYear: 2026,
        cgpa: 7.5,
        targetCareer: 'Backend Developer',
        experienceLevel: 'beginner',
        profileCompletion: 55,
        careerReadinessScore: 30,
        totalSkillsAdded: 3,
      },
    ]);

    // ─── Create Skills ─────────────────────────────────────────────────
    console.log('🛠️  Creating skills...');
    const createdSkills = await Skill.insertMany(
      skillsData.map((s) => ({ ...s, createdBy: admins[0]._id, isVerified: true, isActive: true }))
    );

    // Build skill lookup map (DSA: HashMap for O(1) lookup)
    const skillMap = new Map(createdSkills.map((s) => [s.name, s]));

    // ─── Create Job Roles with Skill References ─────────────────────────
    console.log('💼 Creating job roles...');
    const jobRolesToInsert = jobRolesData.map((role) => ({
      title: role.title,
      description: role.description,
      icon: role.icon,
      category: role.category,
      demandLevel: role.demandLevel,
      averageSalary: role.averageSalary,
      interviewTopics: role.interviewTopics,
      commonCompanies: role.commonCompanies,
      isActive: true,
      createdBy: admins[0]._id,
      requiredSkills: (role.requiredSkillNames || [])
        .map((name, idx) => {
          const skill = skillMap.get(name);
          if (!skill) return null;
          return {
            skill: skill._id,
            importance: idx < 2 ? 'must-have' : idx < 4 ? 'good-to-have' : 'optional',
            minimumLevel: idx < 2 ? 'intermediate' : 'beginner',
            weightage: 10 - idx,
          };
        })
        .filter(Boolean),
    }));

    await JobRole.insertMany(jobRolesToInsert);

    // ─── Create Learning Resources ──────────────────────────────────────
    console.log('📚 Creating learning resources...');
    const resourcesToInsert = resourcesData.map((r) => ({
      ...r,
      skills: (r.skillNames || []).map((n) => skillMap.get(n)?._id).filter(Boolean),
      isApproved: true,
      isActive: true,
      submittedBy: admins[0]._id,
      approvedBy: admins[0]._id,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      totalRatings: Math.floor(Math.random() * 500) + 50,
    }));
    await LearningResource.insertMany(resourcesToInsert);

    // ─── Create User Skills for Students ──────────────────────────────
    console.log('⚡ Adding skills to students...');
    const aarav = students[0];
    const sneha = students[3];

    await UserSkill.insertMany([
      // Aarav's skills (Full Stack)
      { user: aarav._id, name: 'JavaScript', category: 'Programming Language', proficiency: 'intermediate', selfRating: 7 },
      { user: aarav._id, name: 'React.js', category: 'Framework', proficiency: 'intermediate', selfRating: 7 },
      { user: aarav._id, name: 'Node.js', category: 'Framework', proficiency: 'beginner', selfRating: 5 },
      { user: aarav._id, name: 'MongoDB', category: 'Database', proficiency: 'beginner', selfRating: 5 },
      { user: aarav._id, name: 'Git', category: 'Tool', proficiency: 'intermediate', selfRating: 8 },
      { user: aarav._id, name: 'Python', category: 'Programming Language', proficiency: 'beginner', selfRating: 4 },
      { user: aarav._id, name: 'MySQL', category: 'Database', proficiency: 'beginner', selfRating: 4 },
      { user: aarav._id, name: 'Problem Solving', category: 'Soft Skill', proficiency: 'intermediate', selfRating: 7 },
      // Sneha's skills (AI Engineer)
      { user: sneha._id, name: 'Python', category: 'Programming Language', proficiency: 'advanced', selfRating: 9 },
      { user: sneha._id, name: 'Machine Learning', category: 'AI/ML', proficiency: 'intermediate', selfRating: 7 },
      { user: sneha._id, name: 'TensorFlow', category: 'AI/ML', proficiency: 'intermediate', selfRating: 7 },
      { user: sneha._id, name: 'PyTorch', category: 'AI/ML', proficiency: 'intermediate', selfRating: 6 },
      { user: sneha._id, name: 'Pandas', category: 'AI/ML', proficiency: 'advanced', selfRating: 9 },
      { user: sneha._id, name: 'NumPy', category: 'AI/ML', proficiency: 'advanced', selfRating: 9 },
      { user: sneha._id, name: 'Git', category: 'Tool', proficiency: 'intermediate', selfRating: 8 },
      { user: sneha._id, name: 'PostgreSQL', category: 'Database', proficiency: 'beginner', selfRating: 4 },
      { user: sneha._id, name: 'Docker', category: 'DevOps', proficiency: 'beginner', selfRating: 3 },
      { user: sneha._id, name: 'FastAPI', category: 'Framework', proficiency: 'intermediate', selfRating: 7 },
    ]);

    // ─── Create Notifications ──────────────────────────────────────────
    await Notification.insertMany([
      {
        user: aarav._id,
        type: 'profile_incomplete',
        title: '📝 Complete Your Profile',
        message: 'Add your LinkedIn and upload your resume to reach 100% profile completion.',
        icon: '📝',
        link: '/dashboard/profile',
      },
      {
        user: aarav._id,
        type: 'roadmap_reminder',
        title: '🗺️ Generate Your Roadmap',
        message: 'You have skills added! Run an AI analysis and generate your personalized roadmap.',
        icon: '🗺️',
        link: '/dashboard/roadmap',
      },
      {
        user: sneha._id,
        type: 'streak_milestone',
        title: '🔥 15-Day Streak!',
        message: "You've been active for 15 days in a row. Keep it up!",
        icon: '🔥',
        link: '/dashboard',
      },
    ]);

    // ─── Create Sample Achievements ────────────────────────────────────
    await Achievement.insertMany([
      { user: aarav._id, type: 'first_skill', title: '🎯 First Step', description: 'Added your first skill', icon: '🎯', xpEarned: 10 },
      { user: aarav._id, type: 'resume_uploaded', title: '📄 Resume Ready', description: 'Uploaded your resume', icon: '📄', xpEarned: 15 },
      { user: sneha._id, type: 'first_skill', title: '🎯 First Step', description: 'Added your first skill', icon: '🎯', xpEarned: 10 },
      { user: sneha._id, type: 'skill_master', title: '💪 Skill Master', description: 'Added 10+ skills', icon: '💪', xpEarned: 50 },
      { user: sneha._id, type: 'streak_7', title: '🔥 7-Day Streak', description: 'Active for 7 days in a row', icon: '🔥', xpEarned: 40 },
      { user: sneha._id, type: 'profile_complete', title: '⭐ Profile Pro', description: 'Completed 100% of your profile', icon: '⭐', xpEarned: 30 },
    ]);

    console.log(`
╔═══════════════════════════════════════════╗
║    ✅ SkillBridge AI Database Seeded!     ║
╠═══════════════════════════════════════════╣
║  👤 Admins        : 2                     ║
║  🎓 Students      : 5                     ║
║  🛠️  Skills        : ${createdSkills.length.toString().padEnd(26)} ║
║  💼 Job Roles     : ${jobRolesData.length.toString().padEnd(26)} ║
║  📚 Resources     : ${resourcesData.length.toString().padEnd(26)} ║
╠═══════════════════════════════════════════╣
║  Admin Login:                             ║
║  Email: admin@skillbridge.ai              ║
║  Pass:  Admin@123456                      ║
╠═══════════════════════════════════════════╣
║  Student Login:                           ║
║  Email: aarav@example.com                 ║
║  Pass:  Student@123                       ║
╚═══════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDatabase();

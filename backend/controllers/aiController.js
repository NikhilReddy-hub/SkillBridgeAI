const { getGeminiModel } = require('../config/gemini');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const JobRole = require('../models/JobRole');
const Roadmap = require('../models/Roadmap');
const Report = require('../models/Report');
const ChatHistory = require('../models/ChatHistory');
const Notification = require('../models/Notification');
const { AppError, successResponse } = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const socketIO = require('../utils/socketIO');
const achievementService = require('../services/achievementService');

// ─── Helper: Parse JSON safely from AI response ───────────────────────────────
const parseAIResponse = (text) => {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// ─── ANALYZE SKILLS ───────────────────────────────────────────────────────────
exports.analyzeSkills = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user.targetCareer) {
    return next(new AppError('Please set your target career before analyzing skills.', 400));
  }

  const skills = await UserSkill.find({ user: req.user._id });
  if (skills.length === 0) {
    return next(new AppError('Please add at least one skill before analyzing.', 400));
  }

  const jobRole = await JobRole.findOne({ title: user.targetCareer }).populate('requiredSkills.skill');

  // Build skill list for prompt
  const currentSkillsText = skills
    .map((s) => `${s.name} (${s.proficiency}, ${s.selfRating}/10)`)
    .join(', ');

  const requiredSkillsText = jobRole?.requiredSkills
    ?.map((rs) => `${rs.skill?.name || rs.skill} (${rs.importance})`)
    ?.join(', ') || 'Standard industry skills for this role';

  const resumeContext = user.resumeText
    ? `\nResume Summary: ${user.resumeText.substring(0, 2000)}`
    : '';

  const prompt = `
You are an expert career counselor and technical recruiter. Analyze this student's skills for their target career role.

Target Career: ${user.targetCareer}
Experience Level: ${user.experienceLevel}
Current Skills: ${currentSkillsText}
Required Skills for ${user.targetCareer}: ${requiredSkillsText}
${resumeContext}

Perform a comprehensive skill gap analysis and respond ONLY with valid JSON in this exact structure:
{
  "skillMatchPercent": <0-100>,
  "careerReadinessScore": <0-100>,
  "overallGrade": "<A|B|C|D|F>",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": [
    { "name": "skill", "priority": "critical|high|medium|low", "priorityScore": 85, "estimatedHours": 40, "category": "Framework", "reason": "why needed" }
  ],
  "strengthAreas": ["area1", "area2"],
  "improvementAreas": ["area1", "area2"],
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength point"],
  "weaknesses": ["weakness point"],
  "actionPlan": ["action item 1", "action item 2", "action item 3"],
  "resumeScore": <0-100>,
  "resumeFeedback": ["feedback point 1", "feedback point 2"]
}`;

  const model = getGeminiModel();
  let analysis;

  if (!model) {
    // Elegant fallback simulation
    analysis = {
      skillMatchPercent: 65,
      careerReadinessScore: 72,
      overallGrade: "B",
      matchedSkills: skills.map((s) => s.name).slice(0, 3),
      missingSkills: [
        { name: "Docker", priority: "critical", priorityScore: 90, estimatedHours: 20, category: "DevOps", reason: "Standard workspace containerization required for testing and production deployments." },
        { name: "TypeScript", priority: "high", priorityScore: 80, estimatedHours: 25, category: "Programming Language", reason: "Ensures type safety across the client and server codebases." },
        { name: "AWS", priority: "medium", priorityScore: 70, estimatedHours: 35, category: "Cloud", reason: "Crucial for running, scaling and maintaining serverless instances." }
      ],
      strengthAreas: ["Frontend UI Development", "NoSQL database setups"],
      improvementAreas: ["DevOps pipelines", "Static type checkers"],
      summary: "The student has robust programming fundamentals in React and database storage, but lacks containers, cloud computing systems, and security configuration credentials.",
      strengths: ["Strong MVC application patterns", "Solid git versioning discipline"],
      weaknesses: ["No production pipeline setups", "Limited network security profiles"],
      actionPlan: ["Write custom Dockerfiles for front/back servers", "Migrate current Javascript files to TypeScript", "Deploy test servers on Amazon AWS EC2"],
      resumeScore: 85,
      resumeFeedback: ["List specific frameworks instead of generic descriptions", "Quantify bullet points with metrics", "Ensure contact profile links are correct"]
    };
  } else {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      analysis = parseAIResponse(responseText);
    } catch (aiErr) {
      // If quota / rate-limit hit, fall back to mock analysis
      const isQuota = aiErr.message?.includes('429') || aiErr.message?.includes('quota') || aiErr.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        console.warn('⚠️  Gemini quota hit — serving mock analysis');
        analysis = {
          skillMatchPercent: 65,
          careerReadinessScore: 72,
          overallGrade: 'B',
          matchedSkills: skills.map((s) => s.name).slice(0, 3),
          missingSkills: [
            { name: 'Docker', priority: 'critical', priorityScore: 90, estimatedHours: 20, category: 'DevOps', reason: 'Containerization is a must-have for production deployments.' },
            { name: 'TypeScript', priority: 'high', priorityScore: 80, estimatedHours: 25, category: 'Programming Language', reason: 'Type safety reduces bugs across the codebase.' },
            { name: 'AWS', priority: 'medium', priorityScore: 70, estimatedHours: 35, category: 'Cloud', reason: 'Cloud infrastructure is required for scalable deployments.' }
          ],
          strengthAreas: ['Frontend Development', 'NoSQL Databases'],
          improvementAreas: ['DevOps & CI/CD', 'Cloud Computing'],
          summary: 'Strong frontend fundamentals with React and database skills. Needs improvement in DevOps, containerization, and cloud infrastructure.',
          strengths: ['Strong React.js skills', 'Good database knowledge'],
          weaknesses: ['No container experience', 'Limited cloud exposure'],
          actionPlan: ['Learn Docker and containerize your projects', 'Study TypeScript fundamentals', 'Set up a basic AWS account and explore EC2/S3'],
          resumeScore: 78,
          resumeFeedback: ['Add specific metrics to project bullets', 'Include GitHub links to projects', 'Highlight leadership/collaboration skills']
        };
      } else {
        throw aiErr;
      }
    }
  }

  if (!analysis) {
    return next(new AppError('AI analysis failed. Please try again.', 500));
  }

  // Mark existing reports as not latest
  await Report.updateMany({ user: req.user._id }, { isLatest: false });

  // Save new report
  const report = await Report.create({
    user: req.user._id,
    targetRole: user.targetCareer,
    currentSkills: skills.map((s) => s.name),
    requiredSkills: jobRole?.requiredSkills?.map((rs) => rs.skill?.name || rs.skill) || [],
    ...analysis,
    isLatest: true,
  });

  // Update user readiness score
  await User.findByIdAndUpdate(req.user._id, {
    careerReadinessScore: analysis.careerReadinessScore || 0,
  });

  // Send notification
  await Notification.create({
    user: req.user._id,
    type: 'report_ready',
    title: '📊 Skill Analysis Complete!',
    message: `Your career readiness score: ${analysis.careerReadinessScore}%. ${analysis.missingSkills?.length || 0} skills to improve.`,
    icon: '📊',
    link: '/dashboard/skill-report',
  });

  // 🔌 Real-time update — push dashboard refresh to browser
  socketIO.emitToUser(req.user._id, 'dashboard_update', {
    event: 'analysis_complete',
    careerReadinessScore: analysis.careerReadinessScore,
    resumeScore: analysis.resumeScore,
    missingSkillsCount: analysis.missingSkills?.length || 0,
  });

  res.status(200).json({
    success: true,
    message: 'Skill analysis completed successfully.',
    data: { report },
  });
});

// ─── GENERATE ROADMAP ─────────────────────────────────────────────────────────
exports.generateRoadmap = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user.targetCareer) {
    return next(new AppError('Please set your target career first.', 400));
  }

  const [skills, report] = await Promise.all([
    UserSkill.find({ user: req.user._id }),
    Report.findOne({ user: req.user._id, isLatest: true }),
  ]);

  const currentSkillsText = skills.map((s) => `${s.name} (${s.proficiency})`).join(', ') || 'None';
  const missingSkillsText = report?.missingSkills?.map((s) => `${s.name} (priority: ${s.priority})`).join(', ') || 'To be determined';

  const prompt = `
You are a senior technical career coach specializing in ${user.targetCareer} roles. 
Create a detailed, personalized learning roadmap.

Student Profile:
- Target Role: ${user.targetCareer}
- Experience Level: ${user.experienceLevel}
- Current Skills: ${currentSkillsText}
- Missing Skills: ${missingSkillsText}
- Career Readiness: ${user.careerReadinessScore}%

Generate a comprehensive ${user.experienceLevel === 'beginner' ? 16 : 12}-week learning roadmap.

Respond ONLY with valid JSON:
{
  "title": "Roadmap title",
  "overview": "2-3 sentence personalized overview",
  "totalWeeks": 12,
  "steps": [
    {
      "week": 1,
      "title": "Week title",
      "description": "What to focus on this week",
      "skillNames": ["skill1", "skill2"],
      "resources": [
        { "title": "Resource name", "url": "https://...", "type": "youtube|course|documentation|article" }
      ],
      "projects": ["mini project idea"],
      "estimatedHours": 15
    }
  ],
  "missingSkills": [
    { "skill": "name", "priority": "critical", "estimatedHours": 40, "reason": "why" }
  ],
  "strengthAreas": ["area1"],
  "projectRecommendations": [
    {
      "title": "Project name",
      "description": "What to build",
      "skills": ["skill1", "skill2"],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedDays": 7,
      "githubTopics": ["topic1"]
    }
  ],
  "certificationRecommendations": [
    { "name": "Cert name", "provider": "Provider", "url": "https://...", "cost": "Free", "duration": "3 months" }
  ],
  "interviewTips": ["tip1", "tip2", "tip3"],
  "resumeSuggestions": ["suggestion1", "suggestion2"]
}`;

  const model = getGeminiModel();
  let roadmapData;

  if (!model) {
    roadmapData = {
      title: `Learning Roadmap for ${user.targetCareer}`,
      overview: `A comprehensive 12-week learning path structured to resolve your missing skills gaps, configure local environments, and prepare for placement rounds.`,
      totalWeeks: 12,
      steps: [
        {
          week: 1,
          title: "Version Control & Workspace Standups",
          description: "Initialize target folders, understand commit logs, tags, and branch configurations.",
          skillNames: ["Git"],
          resources: [
            { title: "Git Official Documentation", url: "https://git-scm.com/doc", type: "documentation" }
          ],
          projects: ["Configure local folders and trigger repository logs pushing to remote servers."],
          estimatedHours: 10
        },
        {
          week: 2,
          title: "Static Typed Coding Structures",
          description: "Declare typed arrays, union structures, custom parameters, and type interfaces.",
          skillNames: ["TypeScript"],
          resources: [
            { title: "TypeScript Official Handbook Guidelines", url: "https://www.typescriptlang.org/docs/", type: "documentation" }
          ],
          projects: ["Refactor standard JavaScript functions into secure statically typed modules."],
          estimatedHours: 12
        },
        {
          week: 3,
          title: "Containerizing Servers & Apps",
          description: "Write Dockerfiles, isolate processes, map volumes, and run isolated dev servers.",
          skillNames: ["Docker"],
          resources: [
            { title: "Docker Containerization Get Started Tutorial", url: "https://docs.docker.com/get-started/", type: "documentation" }
          ],
          projects: ["Isolate a React web app inside a lightweight node-alpine image."],
          estimatedHours: 15
        }
      ],
      missingSkills: [
        { skill: "Docker", priority: "critical", estimatedHours: 20, reason: "Crucial devops skill for server environment mapping." }
      ],
      strengthAreas: ["JavaScript", "React.js"],
      projectRecommendations: [
        {
          title: "Secure Containerized Portfolio Workspace",
          description: "Run custom nodes behind reverse proxy gateways containerized in Docker.",
          skills: ["TypeScript", "Docker", "Node.js"],
          difficulty: "intermediate",
          estimatedDays: 7,
          githubTopics: ["docker", "typescript"]
        }
      ],
      certificationRecommendations: [
        { name: "AWS Cloud Practitioner Certification", provider: "Amazon Web Services", url: "https://aws.amazon.com/certification/", cost: "Paid", duration: "1 month" }
      ],
      interviewTips: ["Describe difference between virtual and hypervisor environments", "Explain React reconciliation patterns"],
      resumeSuggestions: ["Incorporate clean metric percentages", "Map your tech project repos directly"]
    };
  } else {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      roadmapData = parseAIResponse(responseText);
    } catch (aiErr) {
      const isQuota = aiErr.message?.includes('429') || aiErr.message?.includes('quota') || aiErr.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        console.warn('⚠️  Gemini quota hit — serving mock roadmap');
        // roadmapData stays as the mock set above
        roadmapData = {
          title: `Learning Roadmap for ${user.targetCareer}`,
          overview: 'A comprehensive 12-week learning path to resolve your skill gaps and prepare for placements.',
          totalWeeks: 12,
          steps: [
            { week: 1, title: 'Version Control & Git Mastery', description: 'Learn branching, merging, rebasing and pull request workflows.', skillNames: ['Git'], resources: [{ title: 'Git Official Docs', url: 'https://git-scm.com/doc', type: 'documentation' }], projects: ['Create a team project with branches and PRs.'], estimatedHours: 10 },
            { week: 2, title: 'TypeScript Foundations', description: 'Types, interfaces, generics, and integrating with React and Node.', skillNames: ['TypeScript'], resources: [{ title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'documentation' }], projects: ['Convert a JavaScript module to TypeScript.'], estimatedHours: 12 },
            { week: 3, title: 'Docker & Containerization', description: 'Dockerfiles, volumes, compose, and container networking.', skillNames: ['Docker'], resources: [{ title: 'Docker Get Started', url: 'https://docs.docker.com/get-started/', type: 'documentation' }], projects: ['Containerize your React + Node app.'], estimatedHours: 15 },
            { week: 4, title: 'AWS Fundamentals', description: 'EC2, S3, IAM, and basic cloud deployments on Amazon Web Services.', skillNames: ['AWS'], resources: [{ title: 'AWS Free Training', url: 'https://aws.amazon.com/training/free-digital-training/', type: 'course' }], projects: ['Deploy a Node.js app on EC2.'], estimatedHours: 18 }
          ],
          missingSkills: [{ skill: 'Docker', priority: 'critical', estimatedHours: 20, reason: 'Key DevOps skill for all modern deployments.' }],
          strengthAreas: ['React.js', 'JavaScript', 'Node.js'],
          projectRecommendations: [{ title: 'Full Stack Dockerized App', description: 'React frontend + Express API + MongoDB, all in Docker Compose.', skills: ['React', 'Node.js', 'Docker', 'MongoDB'], difficulty: 'intermediate', estimatedDays: 10, githubTopics: ['docker', 'fullstack'] }],
          certificationRecommendations: [{ name: 'AWS Cloud Practitioner', provider: 'Amazon Web Services', url: 'https://aws.amazon.com/certification/', cost: 'Paid', duration: '1 month' }],
          interviewTips: ['Explain virtual DOM reconciliation', 'Describe REST vs GraphQL tradeoffs', 'Walk through a system design for URL shortener'],
          resumeSuggestions: ['Add GitHub links to all projects', 'Quantify impact with metrics']
        };
      } else {
        throw aiErr;
      }
    }
  }

  if (!roadmapData) {
    return next(new AppError('Failed to generate roadmap. Please try again.', 500));
  }

  // Delete existing roadmap and create new one
  await Roadmap.deleteOne({ user: req.user._id });

  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(
    estimatedCompletionDate.getDate() + (roadmapData.totalWeeks || 12) * 7
  );

  const roadmap = await Roadmap.create({
    user: req.user._id,
    targetRole: user.targetCareer,
    currentSkills: skills.map((s) => s.name),
    estimatedCompletionDate,
    ...roadmapData,
  });

  // Award achievement
  await achievementService.award(req.user._id, 'roadmap_started');

  // Notification
  await Notification.create({
    user: req.user._id,
    type: 'roadmap_reminder',
    title: '🗺️ Your Roadmap is Ready!',
    message: `Your ${roadmapData.totalWeeks}-week personalized roadmap for ${user.targetCareer} has been generated.`,
    icon: '🗺️',
    link: '/dashboard/roadmap',
  });

  // 🔌 Real-time update — push roadmap to browser
  socketIO.emitToUser(req.user._id, 'roadmap_update', {
    event: 'roadmap_generated',
    totalWeeks: roadmapData.totalWeeks,
    title: roadmapData.title,
  });

  res.status(201).json({
    success: true,
    message: 'Learning roadmap generated successfully.',
    data: { roadmap },
  });
});

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
exports.chat = catchAsync(async (req, res, next) => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) return next(new AppError('Message cannot be empty.', 400));

  const user = await User.findById(req.user._id);
  const skills = await UserSkill.find({ user: req.user._id }).limit(20);
  const roadmap = await Roadmap.findOne({ user: req.user._id });
  const report = await Report.findOne({ user: req.user._id, isLatest: true });

  // Build context
  const systemContext = `
You are SkillBridge AI Assistant — a friendly, expert career counselor for students.
Student Context:
- Name: ${user.name}
- Target Role: ${user.targetCareer || 'Not set'}
- Experience: ${user.experienceLevel}
- Current Skills: ${skills.map((s) => s.name).join(', ') || 'None added'}
- Career Readiness: ${user.careerReadinessScore}%
- Missing Skills: ${report?.missingSkills?.slice(0, 5).map((s) => s.name).join(', ') || 'Run analysis first'}
- Roadmap Progress: ${roadmap?.progressPercent || 0}% (${roadmap?.completedWeeks || 0}/${roadmap?.totalWeeks || 0} weeks)

You can help with: skill recommendations, learning resources, project ideas, interview prep, resume tips, career advice.
Be encouraging, specific, and actionable. Format responses clearly with markdown.`;

  // Get or create chat session
  let session;
  if (sessionId) {
    session = await ChatHistory.findOne({ _id: sessionId, user: req.user._id });
  }
  if (!session) {
    session = new ChatHistory({ user: req.user._id, messages: [] });
  }

  // Build conversation history for Gemini
  const history = session.messages.slice(-10).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Start Gemini chat
  const model = getGeminiModel();
  let aiResponse;

  if (!model) {
    const lowercaseMsg = message.toLowerCase();
    if (lowercaseMsg.includes('ready') || lowercaseMsg.includes('interview')) {
      aiResponse = `Based on your profile target **${user.targetCareer || 'Developer'}**, your readiness index sits at **${user.careerReadinessScore}%**. \n\nTo raise your readiness rating:\n1. Solve prerequisites graph dependencies on SkillBridge.\n2. Complete your week milestones on the target roadmap.\n3. Quantify project contributions on your uploaded resume file.`;
    } else if (lowercaseMsg.includes('project') && !lowercaseMsg.includes('tracker') && !lowercaseMsg.includes('graph')) {
      aiResponse = `Here are three great projects to build for a **${user.targetCareer || 'Software Engineer'}** profile:\n\n- **Containerized REST microservice** (NodeJS + Express + Docker + TypeScript)\n- **Secure user token authentication module** (JWT + HTTPOnly Cookie controls)\n- **Graph dependency visuals tracker** (React + Framer Motion representation)\n\nWhich one would you like to build? I can provide the implementation steps!`;
    } else if (lowercaseMsg.includes('tracker') || lowercaseMsg.includes('graph') || lowercaseMsg.includes('visual')) {
      aiResponse = `To build the **Graph Dependency Visual Tracker**, you can follow these steps:
\n1. **Data Structure:** Implement a Directed Graph (Adjacency List) in your code to represent skill relations (e.g. JavaScript points to React).
\n2. **Path Traversal:** Use a Topological Sort (using DFS) or BFS traversal to determine the exact order a student should learn the skills.
\n3. **Frontend Visuals:** Use a library like \`reactflow\` or raw SVG paths. Render skills as circular nodes and dependency paths as SVG curved lines connecting them.
\n4. **Interactivity:** Use Framer Motion or Tailwind transitions to animate paths turning green when a prerequisite skill is marked as complete.
\nWould you like a sample React component structure for this?`;
    } else if (lowercaseMsg.includes('docker') || lowercaseMsg.includes('container')) {
      aiResponse = `Here is how you can set up Docker containerization for your application:
\n1. **Backend Dockerfile:** Create a \`Dockerfile\` in your backend directory:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
\`\`\`
\n2. **Docker Compose:** Create a \`docker-compose.yml\` in the root to run MongoDB, Frontend, and Backend services simultaneously:
\`\`\`yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
\`\`\`
\nWould you like me to draft the Frontend Nginx configuration next?`;
    } else if (lowercaseMsg.includes('typescript') || lowercaseMsg.includes('ts')) {
      aiResponse = `To migrate your codebase to **TypeScript**, follow this checklist:
\n1. **Install TS Dependencies:** Run \`npm i -D typescript @types/react @types/react-dom @types/node @types/express\`
\n2. **Configuration:** Generate a config file using \`npx tsc --init\` and set:
   - \`"target": "ES2022"\`
   - \`"jsx": "react-jsx"\` (for React codebases)
\n3. **Type Declarations:** Create interfaces for your main data objects (e.g., \`interface ISkill { name: string; level: number; }\`) and update file extensions to \`.ts\` and \`.tsx\`.
\nWould you like a template config for your tsconfig.json?`;
    } else if (lowercaseMsg.includes('aws') || lowercaseMsg.includes('cloud') || lowercaseMsg.includes('deploy')) {
      aiResponse = `Here are the steps to deploy your application on **AWS EC2**:
\n1. **Launch EC2 Instance:** Spin up an Ubuntu Server 22.04 LTS instance (t2.micro works for free tier).
\n2. **Configure Security Group:** Open ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
\n3. **Install Docker:** Run \`sudo apt update && sudo apt install docker.io docker-compose -y\`
\n4. **Deploy Containers:** Clone your repo, create your production \`.env\` file, and spin up containers using \`docker compose up -d\`.
\n5. **Reverse Proxy:** Install Nginx and configure it to proxy port 80 traffic to your application port (e.g. 5173/5000).
\nWould you like the Nginx server block config sample?`;
    } else if (lowercaseMsg.includes('cert')) {
      aiResponse = `Valuable industry certifications for a **${user.targetCareer || 'Software Engineer'}** target:\n\n1. **AWS Cloud Practitioner Essentials** (Amazon web services)\n2. **MongoDB Certified Associate Developer** (Database mapping)\n3. **HashiCorp Certified Terraform Associate** (Infrastructure automation)`;
    } else {
      aiResponse = `Hello ${user.name}! I am your AI placement coach. \n\nI can advise you on study schedules, suggest portfolio projects, or review your resume keywords compatibility. What is on your mind?`;
    }
  } else {
    try {
      const chat = model.startChat({
        history,
        systemInstruction: { parts: [{ text: systemContext }] },
      });
      const result = await chat.sendMessage(message);
      aiResponse = result.response.text();
    } catch (aiErr) {
      console.warn('⚠️ Gemini chat call failed — falling back to mock response:', aiErr.message);
      const lowercaseMsg = message.toLowerCase();
      if (lowercaseMsg.includes('ready') || lowercaseMsg.includes('interview')) {
        aiResponse = `Based on your profile target **${user.targetCareer || 'Developer'}**, your readiness index sits at **${user.careerReadinessScore}%**. \n\nTo raise your readiness rating:\n1. Solve prerequisites graph dependencies on SkillBridge.\n2. Complete your week milestones on the target roadmap.\n3. Quantify project contributions on your uploaded resume file.`;
      } else if (lowercaseMsg.includes('project') && !lowercaseMsg.includes('tracker') && !lowercaseMsg.includes('graph')) {
        aiResponse = `Here are three great projects to build for a **${user.targetCareer || 'Software Engineer'}** profile:\n\n- **Containerized REST microservice** (NodeJS + Express + Docker + TypeScript)\n- **Secure user token authentication module** (JWT + HTTPOnly Cookie controls)\n- **Graph dependency visuals tracker** (React + Framer Motion representation)\n\nWhich one would you like to build? I can provide the implementation steps!`;
      } else if (lowercaseMsg.includes('tracker') || lowercaseMsg.includes('graph') || lowercaseMsg.includes('visual')) {
        aiResponse = `To build the **Graph Dependency Visual Tracker**, you can follow these steps:
\n1. **Data Structure:** Implement a Directed Graph (Adjacency List) in your code to represent skill relations (e.g. JavaScript points to React).
\n2. **Path Traversal:** Use a Topological Sort (using DFS) or BFS traversal to determine the exact order a student should learn the skills.
\n3. **Frontend Visuals:** Use a library like \`reactflow\` or raw SVG paths. Render skills as circular nodes and dependency paths as SVG curved lines connecting them.
\n4. **Interactivity:** Use Framer Motion or Tailwind transitions to animate paths turning green when a prerequisite skill is marked as complete.
\nWould you like a sample React component structure for this?`;
      } else if (lowercaseMsg.includes('docker') || lowercaseMsg.includes('container')) {
        aiResponse = `Here is how you can set up Docker containerization for your application:
\n1. **Backend Dockerfile:** Create a \`Dockerfile\` in your backend directory:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
\`\`\`
\n2. **Docker Compose:** Create a \`docker-compose.yml\` in the root to run MongoDB, Frontend, and Backend services simultaneously:
\`\`\`yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
\`\`\`
\nWould you like me to draft the Frontend Nginx configuration next?`;
    } else if (lowercaseMsg.includes('typescript') || lowercaseMsg.includes('ts')) {
      aiResponse = `To migrate your codebase to **TypeScript**, follow this checklist:
\n1. **Install TS Dependencies:** Run \`npm i -D typescript @types/react @types/react-dom @types/node @types/express\`
\n2. **Configuration:** Generate a config file using \`npx tsc --init\` and set:
   - \`"target": "ES2022"\`
   - \`"jsx": "react-jsx"\` (for React codebases)
\n3. **Type Declarations:** Create interfaces for your main data objects (e.g., \`interface ISkill { name: string; level: number; }\`) and update file extensions to \`.ts\` and \dots.
\nWould you like a template config for your tsconfig.json?`;
    } else if (lowercaseMsg.includes('aws') || lowercaseMsg.includes('cloud') || lowercaseMsg.includes('deploy')) {
      aiResponse = `Here are the steps to deploy your application on **AWS EC2**:
\n1. **Launch EC2 Instance:** Spin up an Ubuntu Server 22.04 LTS instance (t2.micro works for free tier).
\n2. **Configure Security Group:** Open ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
\n3. **Install Docker:** Run \`sudo apt update && sudo apt install docker.io docker-compose -y\`
\n4. **Deploy Containers:** Clone your repo, create your production \`.env\` file, and spin up containers using \`docker compose up -d\`.
\n5. **Reverse Proxy:** Install Nginx and configure it to proxy port 80 traffic to your application port (e.g. 5173/5000).
\nWould you like the Nginx server block config sample?`;
      } else if (lowercaseMsg.includes('cert')) {
        aiResponse = `Valuable industry certifications for a **${user.targetCareer || 'Software Engineer'}** target:\n\n1. **AWS Cloud Practitioner Essentials** (Amazon web services)\n2. **MongoDB Certified Associate Developer** (Database mapping)\n3. **HashiCorp Certified Terraform Associate** (Infrastructure automation)`;
      } else {
        aiResponse = `Hello ${user.name}! I am your AI placement coach. \n\nI can advise you on study schedules, suggest portfolio projects, or review your resume keywords compatibility. What is on your mind?`;
      }
    }
  }

  // Save messages
  session.messages.push({ role: 'user', content: message });
  session.messages.push({ role: 'assistant', content: aiResponse });
  session.context = {
    targetRole: user.targetCareer,
    currentSkills: skills.map((s) => s.name),
  };
  await session.save();

  // Award chat achievement
  const chatCount = await ChatHistory.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: null, total: { $sum: '$messageCount' } } },
  ]);
  if ((chatCount[0]?.total || 0) >= 10) {
    await achievementService.award(req.user._id, 'chat_explorer');
  }

  res.status(200).json({
    success: true,
    data: {
      sessionId: session._id,
      message: { role: 'assistant', content: aiResponse },
    },
  });
});

// ─── GET CHAT SESSIONS ────────────────────────────────────────────────────────
exports.getChatSessions = catchAsync(async (req, res) => {
  const sessions = await ChatHistory.find({ user: req.user._id })
    .select('sessionTitle messageCount createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(20);

  res.status(200).json({ success: true, data: { sessions } });
});

exports.getChatSession = catchAsync(async (req, res, next) => {
  const session = await ChatHistory.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) return next(new AppError('Chat session not found.', 404));

  res.status(200).json({ success: true, data: { session } });
});

// ─── INTERVIEW TIPS ───────────────────────────────────────────────────────────
exports.getInterviewTips = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const skills = await UserSkill.find({ user: req.user._id });

  if (!user.targetCareer) {
    return next(new AppError('Please set your target career first.', 400));
  }

  const prompt = `
Generate 10 specific, actionable interview preparation tips for a ${user.experienceLevel} ${user.targetCareer} candidate.
Their current skills: ${skills.map((s) => s.name).join(', ')}.

Include:
1. Technical topics to master
2. Common interview questions
3. System design/coding tips (if applicable)
4. Behavioral/HR tips
5. Resume presentation tips

Respond with JSON: { "tips": [{ "category": "Technical|Behavioral|Resume", "tip": "...", "priority": "high|medium" }] }`;

  const model = getGeminiModel();
  let tips;

  if (!model) {
    tips = {
      tips: [
        { category: "Technical", tip: "Practice coding key algorithms on arrays, lists, maps, queues and graph traversal models (BFS/DFS).", priority: "high" },
        { category: "Technical", tip: "Understand Node event loops and asynchronous I/O thread operations.", priority: "high" },
        { category: "System Design", tip: "Explain database index configurations, horizontal sharding, caching architectures, and load balance gateways.", priority: "medium" },
        { category: "Behavioral", tip: "Formulate scenario explanations using Situations, Tasks, Actions, Results (STAR pattern).", priority: "medium" }
      ]
    };
  } else {
    try {
      const result = await model.generateContent(prompt);
      tips = parseAIResponse(result.response.text());
    } catch (aiErr) {
      const isQuota = aiErr.message?.includes('429') || aiErr.message?.includes('quota') || aiErr.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        console.warn('⚠️  Gemini quota hit — serving mock interview tips');
        tips = { tips: [
          { category: 'Technical', tip: 'Practice LeetCode arrays, hashmaps, and graph traversal (BFS/DFS) daily.', priority: 'high' },
          { category: 'Technical', tip: 'Deeply understand async/await, event loop, and promises in JavaScript.', priority: 'high' },
          { category: 'System Design', tip: 'Study REST API design, database indexing, and caching strategies.', priority: 'medium' },
          { category: 'Behavioral', tip: 'Use STAR format: Situation → Task → Action → Result for every story.', priority: 'medium' }
        ]};
      } else { throw aiErr; }
    }
  }

  res.status(200).json({
    success: true,
    data: { tips: tips?.tips || [], targetRole: user.targetCareer },
  });
});

// ─── RESUME REVIEW ────────────────────────────────────────────────────────────
exports.reviewResume = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user.resumeText) {
    return next(new AppError('Please upload your resume first.', 400));
  }

  const prompt = `
Review this student's resume for a ${user.targetCareer} role. 
Resume content: ${user.resumeText.substring(0, 3000)}

Provide detailed feedback. Respond with JSON:
{
  "overallScore": <0-100>,
  "sections": {
    "formatting": <0-10>,
    "content": <0-10>,
    "keywords": <0-10>,
    "achievements": <0-10>,
    "skills": <0-10>
  },
  "strengths": ["strength1"],
  "improvements": ["improvement1"],
  "missingElements": ["element1"],
  "keywordsToAdd": ["keyword1"],
  "summary": "overall assessment"
}`;

  const model = getGeminiModel();
  let review;

  if (!model) {
    review = {
      overallScore: 82,
      sections: {
        formatting: 9,
        content: 8,
        keywords: 7,
        achievements: 8,
        skills: 8
      },
      strengths: [
        "Clean, legible layout structure",
        "Clear technical profiling metrics and github linkages"
      ],
      improvements: [
        "Quantify project outcomes (e.g. 'boosted performance by 20%')",
        "Add standard keywords to match candidate requirements"
      ],
      missingElements: [
        "Infrastructure scaling project bullet references"
      ],
      keywordsToAdd: [
        "CI/CD Pipelines",
        "Docker Containerization",
        "AWS Cloud Infrastructure"
      ],
      summary: "Your profile formatting is excellent. Target your project descriptions by introducing active keyword terms and numerical impact summaries."
    };
  } else {
    try {
      const result = await model.generateContent(prompt);
      review = parseAIResponse(result.response.text());
    } catch (aiErr) {
      const isQuota = aiErr.message?.includes('429') || aiErr.message?.includes('quota') || aiErr.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        console.warn('⚠️  Gemini quota hit — serving mock resume review');
        review = {
          overallScore: 82,
          sections: { formatting: 9, content: 8, keywords: 7, achievements: 8, skills: 8 },
          strengths: ["Clean, legible layout structure", "Clear technical profiling metrics and github linkages"],
          improvements: ["Quantify project outcomes (e.g. 'boosted performance by 20%')", "Add standard keywords to match candidate requirements"],
          missingElements: ["Infrastructure scaling project bullet references"],
          keywordsToAdd: ["CI/CD Pipelines", "Docker Containerization", "AWS Cloud Infrastructure"],
          summary: "Your profile formatting is excellent. Target your project descriptions by introducing active keyword terms and numerical impact summaries."
        };
      } else {
        throw aiErr;
      }
    }
  }

  res.status(200).json({ success: true, data: { review } });
});

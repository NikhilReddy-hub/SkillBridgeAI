import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Code, Target, Map, Award, BookOpen } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden hero-gradient">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[var(--primary-500)]" />
          <span className="font-display font-black text-xl tracking-tight gradient-text-primary">SkillBridge AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn btn-ghost font-medium text-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-[var(--primary-50)] text-[var(--primary-700)] px-4 py-1.5 rounded-full text-xs font-bold mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" /> Empowering the Next Generation of Tech Talent
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-4xl leading-[1.1] mb-8"
        >
          Bridge the Gap Between Student and <span className="gradient-text">Industry Expert</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10"
        >
          Upload your resume, select your target career, and let AI analyze your skills to generate custom interactive study plans, project suggestions, and roadmap strategies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Free Skill Analysis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/explore" className="btn btn-secondary btn-lg">Explore Career Path Map</Link>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-center mb-16">
          Everything You Need to Get Placed
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card">
            <Brain className="h-10 w-10 text-[var(--primary-500)] mb-6" />
            <h3 className="font-display text-xl font-bold mb-3">AI Skill Gap Analysis</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              We analyze your resume against industry benchmarks for roles like Full Stack, Cloud, DevOps, or AI Engineer.
            </p>
          </div>

          <div className="feature-card">
            <Map className="h-10 w-10 text-purple-500 mb-6" />
            <h3 className="font-display text-xl font-bold mb-3">Dynamic Learning Roadmaps</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Receive a weekly personalized study plan loaded with recommended docs, videos, articles, and target project options.
            </p>
          </div>

          <div className="feature-card">
            <Code className="h-10 w-10 text-pink-500 mb-6" />
            <h3 className="font-display text-xl font-bold mb-3">Placement Readiness Tracker</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Earn XP and level up badges. Practice with AI-suggested mock interviews and track metrics via charts.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-7xl mx-auto px-8 pb-24 flex justify-center">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-white shadow-2xl p-4 w-full max-w-5xl">
          <div className="bg-[var(--bg-primary)] p-6 rounded-xl flex items-center justify-between border border-[var(--border-color)] mb-4">
            <div className="flex gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-red-400"></div>
              <div className="h-3.5 w-3.5 rounded-full bg-yellow-400"></div>
              <div className="h-3.5 w-3.5 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">SkillBridge Dashboard UI Demo</span>
            <div className="w-10"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
            <div className="md:col-span-3 space-y-6">
              <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                <h4 className="font-display font-bold text-lg mb-2">My Skill Gap Roadmap Progress</h4>
                <div className="progress-bar my-4">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
                  <span>Completed: Week 8 of 12</span>
                  <span>65% Match Rating</span>
                </div>
              </div>
            </div>
            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col justify-between">
              <div>
                <Award className="h-8 w-8 text-yellow-500 mb-2" />
                <h5 className="font-semibold text-sm">Streak Status</h5>
                <p className="text-2xl font-black gradient-text">15 Days 🔥</p>
              </div>
              <span className="text-xs text-[var(--text-muted)]">Keep studying to maintain your streak!</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

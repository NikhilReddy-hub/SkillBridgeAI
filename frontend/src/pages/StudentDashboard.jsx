import { useState, useEffect } from 'react';
import { studentAPI } from '../api/services';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Award, Zap, Code, Target, BookOpen, Compass, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const { dashboardUpdate } = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh when AI analysis completes in real-time
  useEffect(() => {
    if (dashboardUpdate) {
      toast.success(`📊 Dashboard updated! Readiness: ${dashboardUpdate.careerReadinessScore}%`, { duration: 4000 });
      fetchDashboardData();
    }
  }, [dashboardUpdate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
      </div>
    );
  }

  const { user, stats, skillGapSummary, roadmapSteps, weeklyProgressChart, achievements } = data || {};

  return (
    <div className="space-y-8">
      {/* Target Role & Profile Alert */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-[var(--primary-600)] tracking-wider">Target Career Path</span>
          <h2 className="text-2xl font-black font-display mt-1">{user?.targetCareer || 'Select Target Career 🎯'}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {user?.targetCareer ? 'AI model is tracking your roadmap and matching proficiency scores.' : 'Set your career goals in profile settings to trigger AI gap reports.'}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center bg-[var(--border-subtle)] p-3 rounded-xl min-w-[90px]">
            <span className="block text-[10px] uppercase font-black text-[var(--text-secondary)]">Readiness</span>
            <span className="text-xl font-black gradient-text">{user?.careerReadinessScore || 0}%</span>
          </div>
          <div className="text-center bg-[var(--border-subtle)] p-3 rounded-xl min-w-[90px]">
            <span className="block text-[10px] uppercase font-black text-[var(--text-secondary)]">Streak</span>
            <span className="text-xl font-black text-amber-500">🔥 {user?.streak || 0}d</span>
          </div>
          <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm p-3">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid: Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Profile Completion</span>
          <p className="text-3xl font-black font-display mt-1">{user?.profileCompletion}%</p>
          <div className="progress-bar mt-3">
            <div className="progress-fill" style={{ width: `${user?.profileCompletion}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Total Skills Tracked</span>
          <p className="text-3xl font-black font-display mt-1">{stats?.totalSkills || 0}</p>
          <span className="text-xs text-[var(--text-secondary)] block mt-2">Mapped categories: {Object.keys(stats?.skillsByCategory || {}).length}</span>
        </div>

        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Roadmap Completion</span>
          <p className="text-3xl font-black font-display mt-1">{stats?.roadmapProgress}%</p>
          <div className="progress-bar mt-3">
            <div className="progress-fill" style={{ width: `${stats?.roadmapProgress}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Completed Projects</span>
          <p className="text-3xl font-black font-display mt-1">{stats?.projectsCompleted || 0}</p>
          <span className="text-xs text-[var(--text-secondary)] block mt-2">Certifications: {stats?.certificatesAdded || 0}</span>
        </div>
      </div>

      {/* Grid: Charts & Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-lg font-bold">Weekly Performance</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Study hours vs Readiness index trends</p>
            </div>
            <BarChart2 className="h-5 w-5 text-[var(--primary-500)]" />
          </div>
          <div className="h-64">
            {weeklyProgressChart?.length === 0 ? (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-xl">
                <span className="text-xs text-[var(--text-secondary)]">No weekly activities logged yet. Track study progress to plot logs.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgressChart}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                  <Area type="monotone" dataKey="hoursStudied" name="Hours Studied" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Roadmap Next Steps */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Upcoming Weekly Focus</h3>
            <div className="space-y-4">
              {roadmapSteps?.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">No roadmap steps. Generate target path roadmap.</p>
                  <Link to="/dashboard/roadmap" className="text-xs text-[var(--primary-500)] font-bold mt-2 inline-block hover:underline">Get Roadmap Now</Link>
                </div>
              ) : (
                roadmapSteps.map((step) => (
                  <div key={step.week} className="flex gap-3 items-start border-b border-[var(--border-color)] pb-3 last:border-b-0 last:pb-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-50)] text-xs font-bold text-[var(--primary-700)] shrink-0">W{step.week}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{step.title}</p>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {step.skills?.map((sk) => (
                          <span key={sk} className="text-[10px] bg-[var(--border-subtle)] px-2 py-0.5 rounded text-[var(--text-secondary)]">{sk}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {roadmapSteps?.length > 0 && (
            <Link to="/dashboard/roadmap" className="btn btn-secondary w-full text-xs font-semibold mt-4 py-2">
              View Complete Roadmap <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Grid: Skill Gap & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skill Gap Analysis Box */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
          <h3 className="font-display text-lg font-bold mb-4">Skill Gap Analysis Snapshot</h3>
          {skillGapSummary ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-red-500 block mb-2">Priority Missing Skills</span>
                <div className="flex flex-wrap gap-2">
                  {skillGapSummary.missingSkills?.map((m) => (
                    <span key={m.name} className={`badge text-xs ${
                      m.priority === 'critical' ? 'badge-critical' : 'badge-high'
                    }`}>{m.name} ({m.priority})</span>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-emerald-500 block mb-2">Strength Areas</span>
                <div className="flex flex-wrap gap-2">
                  {skillGapSummary.strengthAreas?.map((s) => (
                    <span key={s} className="badge badge-green text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Compass className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">Run AI skill gap analysis matching target role.</p>
              <Link to="/dashboard/roadmap" className="btn btn-primary text-xs py-2 mt-4">Run Gap Check</Link>
            </div>
          )}
        </div>

        {/* Achievements list */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm">
          <h3 className="font-display text-lg font-bold mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {achievements?.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <Award className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No badges unlocked. Study and use features to earn XP.</p>
              </div>
            ) : (
              achievements.slice(0, 4).map((a) => (
                <div key={a._id} className="flex items-center gap-3 bg-[var(--border-subtle)] p-3 rounded-xl border border-[var(--border-color)]">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{a.title}</p>
                    <span className="text-[10px] text-amber-500 font-bold">+{a.xpEarned} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

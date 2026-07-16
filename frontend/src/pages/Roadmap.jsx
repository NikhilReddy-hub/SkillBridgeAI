import { useState, useEffect } from 'react';
import { aiAPI, studentAPI } from '../api/services';
import { Sparkles, Brain, CheckCircle, Clock, BookOpen, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoadmapAndReport = async () => {
    try {
      setLoading(true);
      const [roadmapRes, reportRes] = await Promise.all([
        studentAPI.getDashboard().then((res) => res.data.data.roadmapSteps ? res.data.data : { roadmapSteps: [] }),
        studentAPI.getSkillReport(),
      ]);

      // Handle cases where roadmap is present in dashboard response or fetch details
      setReport(reportRes.data.data.report);
      
      // Fetch full roadmap if exists
      const profile = await studentAPI.getProfile();
      if (profile.data.data.user.targetCareer) {
        // If target role exists, fetch custom roadmap steps
        const dash = await studentAPI.getDashboard();
        setRoadmap(dash.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapAndReport();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setActionLoading(true);
      toast.loading('Analyzing skills gaps...', { id: 'ai' });
      await aiAPI.analyzeSkills();
      toast.success('Skill gap analysis complete! 📊', { id: 'ai' });
      fetchRoadmapAndReport();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete analysis', { id: 'ai' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      setActionLoading(true);
      toast.loading('Generating learning roadmap...', { id: 'ai' });
      await aiAPI.generateRoadmap();
      toast.success('Roadmap generated successfully! 🗺️', { id: 'ai' });
      fetchRoadmapAndReport();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap', { id: 'ai' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkWeekComplete = async (weekNum) => {
    try {
      await studentAPI.updateProgress({ completedRoadmapWeek: weekNum });
      toast.success(`Week ${weekNum} marked as complete!`);
      fetchRoadmapAndReport();
    } catch (err) {
      toast.error('Failed to update week status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
      </div>
    );
  }

  const stepsList = roadmap?.weeklyProgressChart || [];

  return (
    <div className="space-y-8">
      {/* Top action cards */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-display">AI Placement Roadmap</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Get placement-ready with interactive step-by-step custom roadmaps.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRunAnalysis} disabled={actionLoading} className="btn btn-secondary">
            <Brain className="h-4 w-4" /> Run Skill Analysis
          </button>
          <button onClick={handleGenerateRoadmap} disabled={actionLoading} className="btn btn-primary">
            <Sparkles className="h-4 w-4" /> Generate New Roadmap
          </button>
        </div>
      </div>

      {/* Reports Section */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-xl md:col-span-2 space-y-4">
            <h3 className="font-display font-bold text-lg">AI Gap Report Summary</h3>
            <p className="text-xs text-[var(--text-secondary)]">{report.summary}</p>
            <div>
              <span className="text-xs font-bold block mb-1">Top Action Plan Items</span>
              <ul className="list-disc pl-5 text-xs text-[var(--text-secondary)] space-y-1">
                {report.actionPlan?.map((ap, i) => (
                  <li key={i}>{ap}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-xl space-y-3">
            <h4 className="font-semibold text-sm">Resume Score</h4>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black gradient-text">{report.resumeScore || 0}/100</span>
            </div>
            <ul className="text-[11px] text-[var(--text-secondary)] space-y-1">
              {report.resumeFeedback?.slice(0, 3).map((f, i) => (
                <li key={i} className="flex gap-1.5 items-start">
                  <CheckCircle className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Roadmap display */}
      {roadmap?.roadmapSteps?.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <h3 className="font-bold text-lg">No roadmap active</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Please trigger the AI generator from the button at the top to build your custom path.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold">Interactive Learning Timeline</h3>
          <div className="space-y-6">
            {roadmap?.roadmapSteps?.slice(0, 8).map((step) => (
              <div key={step.week} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 relative flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary text-xs">Week {step.week}</span>
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                      <Clock className="h-3 w-3" /> {step.estimatedHours} hrs
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-lg">{step.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-2xl">{step.description}</p>
                  
                  {/* Skill Badges */}
                  <div className="flex gap-1.5 flex-wrap">
                    {step.skills?.map((sk) => (
                      <span key={sk} className="text-[10px] bg-[var(--border-subtle)] px-2.5 py-1 rounded-md text-[var(--text-secondary)] font-bold">{sk}</span>
                    ))}
                  </div>

                  {/* Resources Links */}
                  {step.resources?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold block mb-1">Recommended Guides</span>
                      <div className="flex flex-wrap gap-3">
                        {step.resources.map((r, idx) => (
                          <a key={idx} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-[var(--primary-600)] hover:underline">
                            <BookOpen className="h-3.5 w-3.5" /> {r.title} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() => handleMarkWeekComplete(step.week)}
                    className="btn btn-secondary text-xs"
                  >
                    Mark Week Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

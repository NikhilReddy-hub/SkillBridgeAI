import { useState, useEffect } from 'react';
import { adminAPI } from '../api/services';
import { Users, GraduationCap, Shield, BookOpen, Map, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
      </div>
    );
  }

  const { overview, topCareerChoices, skillsByCategory } = data || {};

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black font-display">System Administration Portal</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Monitor users, skills catalog, roadmap requests, and database statistics.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn btn-secondary">
          <RefreshCw className="h-4 w-4" /> Refresh Stats
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Total Registered Students</span>
          <p className="text-3xl font-black font-display mt-1">{overview?.totalStudents || 0}</p>
        </div>

        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Master Skills Catalog</span>
          <p className="text-3xl font-black font-display mt-1">{overview?.totalSkills || 0}</p>
        </div>

        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Active Job Roles</span>
          <p className="text-3xl font-black font-display mt-1">{overview?.totalJobRoles || 0}</p>
        </div>

        <div className="stat-card">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Avg Readiness Score</span>
          <p className="text-3xl font-black font-display mt-1">{overview?.avgReadinessScore || 0}%</p>
        </div>
      </div>

      {/* Grid Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Careers */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
          <h3 className="font-display text-lg font-bold mb-4">Top Career Choices</h3>
          <div className="space-y-3">
            {topCareerChoices?.map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-[var(--border-subtle)] p-3 rounded-xl">
                <span className="text-sm font-semibold">{item._id || 'Undecided'}</span>
                <span className="badge badge-primary text-xs">{item.count} students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
          <h3 className="font-display text-lg font-bold mb-4">Popular Skill Categories</h3>
          <div className="space-y-3">
            {skillsByCategory?.map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-[var(--border-subtle)] p-3 rounded-xl">
                <span className="text-sm font-semibold">{item._id}</span>
                <span className="badge badge-purple text-xs">{item.count} entries</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { studentAPI } from '../api/services';
import { Trophy, Award, Target, Star, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await studentAPI.getDashboard();
        setAchievements(res.data.data.achievements || []);
      } catch (err) {
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const totalXP = achievements.reduce((acc, a) => acc + (a.xpEarned || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[var(--gradient-primary)] text-white p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider opacity-90">My Gaming Center</span>
          <h2 className="text-3xl font-black font-display">Milestones & Career Levels</h2>
          <p className="text-sm opacity-80 max-w-lg">Complete actions inside the platform to unlock achievements, gain XP, and level up your ranking.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl min-w-[150px] text-center">
          <Star className="h-6 w-6 text-yellow-300 mx-auto mb-1 animate-pulse" />
          <span className="block text-[10px] uppercase font-bold opacity-80">Total Experience Points</span>
          <span className="text-3xl font-black font-display">{totalXP} XP</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold">Unlocked Badges</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
            <Award className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">Start completing your profile or study roadmap goals to unlock badges.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((a) => (
              <div key={a._id} className="card p-5 flex gap-4 items-center">
                <span className="text-4xl p-3 bg-[var(--border-subtle)] rounded-2xl">{a.icon || '🏅'}</span>
                <div>
                  <h4 className="font-display font-bold text-base">{a.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{a.description}</p>
                  <span className="inline-block text-[10px] font-bold text-amber-500 mt-2 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                    +{a.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

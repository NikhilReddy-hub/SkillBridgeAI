import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Map,
  Compass,
  MessageSquare,
  Trophy,
  Shield,
  BookOpen,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const studentLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Skills', path: '/dashboard/skills', icon: GraduationCap },
    { label: 'Career Roadmap', path: '/dashboard/roadmap', icon: Map },
    { label: 'Search & Explore', path: '/dashboard/explore', icon: Compass },
    { label: 'AI Chat Assistant', path: '/dashboard/chat', icon: MessageSquare },
    { label: 'Achievements & Leaderboard', path: '/dashboard/achievements', icon: Trophy },
    { label: 'Profile Settings', path: '/dashboard/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Skills', path: '/admin/skills', icon: GraduationCap },
    { label: 'Manage Job Roles', path: '/admin/roles', icon: Shield },
    { label: 'Manage Resources', path: '/admin/resources', icon: BookOpen },
    { label: 'User Reports', path: '/admin/reports', icon: User },
  ];

  const activeLinks = isStudent ? studentLinks : adminLinks;

  return (
    <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col h-screen shrink-0">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[var(--border-color)]">
        <Sparkles className="h-6 w-6 text-[var(--primary-500)]" />
        <h1 className="font-display font-black text-lg tracking-tight gradient-text-primary">
          SkillBridge AI
        </h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {activeLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-grow">{link.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 bg-[var(--border-subtle)] p-2.5 rounded-xl">
          <div className="h-9 w-9 rounded-full bg-[var(--gradient-primary)] text-white font-bold flex items-center justify-center">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{user?.name}</p>
            <span className="text-[10px] uppercase font-bold text-[var(--primary-600)]">{user?.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

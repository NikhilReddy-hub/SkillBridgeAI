import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationAPI } from '../api/services';
import { Bell, Sun, Moon, LogOut, User, Check, ShieldAlert, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { liveNotifications, isConnected } = useSocket();
  const prevLiveCountRef = useRef(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getNotifications({ limit: 5 });
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Real-time: when a new notification arrives via Socket.io
  useEffect(() => {
    if (liveNotifications.length > prevLiveCountRef.current) {
      const newest = liveNotifications[0];
      if (newest) {
        toast.custom(() => (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', padding: '12px 16px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 4px 20px rgba(102,126,234,0.4)', minWidth: '280px'
          }}>
            <span style={{ fontSize: '22px' }}>{newest.icon || '🔔'}</span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{newest.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>{newest.message}</div>
            </div>
          </div>
        ), { duration: 5000 });
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [newest, ...prev].slice(0, 5));
      }
    }
    prevLiveCountRef.current = liveNotifications.length;
  }, [liveNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
          Welcome back, <span className="gradient-text-primary">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost rounded-lg p-2"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="btn-ghost relative rounded-lg p-2"
          >
            <Bell className="h-5 w-5" />
            {/* Live connection indicator */}
            {isConnected && (
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-green-400 ring-1 ring-white animate-pulse" title="Real-time connected" />
            )}
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 px-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-[var(--primary-500)] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-[var(--text-muted)]">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                      className={`flex items-start gap-3 rounded-lg p-2.5 hover:bg-[var(--border-subtle)] cursor-pointer ${
                        !n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <span className="text-lg mt-0.5">{n.icon || '🔔'}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{n.title}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                      </div>
                      {!n.isRead && <Check className="h-3.5 w-3.5 text-[var(--primary-500)] shrink-0 mt-1" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 rounded-full border border-[var(--border-color)] bg-[var(--border-subtle)] px-3 py-1.5 hover:border-[var(--primary-300)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--gradient-primary)] text-sm font-bold text-white uppercase">
              {user?.name?.charAt(0)}
            </div>
            <span className="text-sm font-medium hidden md:inline">{user?.role}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 shadow-xl">
              <div className="border-b border-[var(--border-color)] pb-2 mb-1 px-3">
                <p className="text-xs font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">{user?.email}</p>
              </div>
              <Link to="/dashboard/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--border-subtle)]">
                <User className="h-4 w-4" /> Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--border-subtle)]">
                  <ShieldAlert className="h-4 w-4" /> Admin Portal
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

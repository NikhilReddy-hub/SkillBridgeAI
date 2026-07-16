import { useState, useEffect } from 'react';
import { adminAPI } from '../api/services';
import { ShieldAlert, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({ role: 'student' });
      setUsers(res.data.data.users || []);
    } catch (err) {
      toast.error('Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account and cascade delete all their profiles/skills/roadmaps?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <h2 className="text-2xl font-black font-display">Manage Platform Users & Reports</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Review active student registration status, career choices, and database listings.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--border-subtle)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-secondary)]">
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Target Career</th>
                <th className="p-4">Readiness Rating</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[var(--border-color)] hover:bg-[var(--border-subtle)]/40 text-sm">
                  <td className="p-4 font-semibold">{u.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="p-4 font-medium text-[var(--primary-600)]">{u.targetCareer || 'Not Set'}</td>
                  <td className="p-4 font-black">{u.careerReadinessScore || 0}%</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(u._id)} className="p-1 hover:text-red-500">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

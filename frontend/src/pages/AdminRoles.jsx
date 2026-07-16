import { useState, useEffect } from 'react';
import { adminAPI } from '../api/services';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getJobRoles();
      setRoles(res.data.data.roles || []);
    } catch (err) {
      toast.error('Failed to load job roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createJobRole({ title, description, category });
      toast.success('Job role created successfully!');
      setTitle('');
      setDescription('');
      setShowAddForm(false);
      fetchRoles();
    } catch (err) {
      toast.error('Failed to create job role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job role reference?')) return;
    try {
      await adminAPI.deleteJobRole(id);
      toast.success('Job role deleted');
      fetchRoles();
    } catch (err) {
      toast.error('Failed to delete job role');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black font-display">Manage Career Job Roles</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure active career targets and map required skills weightages.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Add Role
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4 max-w-xl shadow-sm">
          <h3 className="font-display font-bold text-base">Create Job Role Reference</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cloud Architect" className="input" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="Development">Development</option>
                <option value="Data">Data</option>
                <option value="Cloud">Cloud</option>
                <option value="Security">Security</option>
                <option value="AI/ML">AI/ML</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input h-24" placeholder="Brief summary..." />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full py-2.5">Save Job Role</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r._id} className="card p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="badge badge-primary text-[10px] uppercase font-bold">{r.category}</span>
                  <button onClick={() => handleDelete(r._id)} className="p-1 text-[var(--text-secondary)] hover:text-red-500">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <h3 className="font-display font-bold text-lg mt-3">{r.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-3">{r.description || 'No description added yet.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

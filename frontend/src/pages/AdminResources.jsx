import { useState, useEffect } from 'react';
import { adminAPI } from '../api/services';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('documentation');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getResources({ limit: 100 });
      setResources(res.data.data.resources || []);
    } catch (err) {
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createResource({ title, url, type });
      toast.success('Resource added to curriculum catalog');
      setTitle('');
      setUrl('');
      setShowAddForm(false);
      fetchResources();
    } catch (err) {
      toast.error('Failed to add resource');
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveResource(id);
      toast.success('Resource approved for display');
      fetchResources();
    } catch (err) {
      toast.error('Failed to approve resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource entry?')) return;
    try {
      await adminAPI.deleteResource(id);
      toast.success('Resource removed');
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black font-display">Manage Learning Resources</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure active documentation, videos, or course guides.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4 max-w-xl shadow-sm">
          <h3 className="font-display font-bold text-base">Add Master Resource</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Docker official guide" className="input" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="input" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                <option value="documentation">Documentation</option>
                <option value="youtube">YouTube Video</option>
                <option value="article">Article</option>
                <option value="course">Course</option>
                <option value="practice">Practice Website</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full py-2.5">Save Resource</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--border-subtle)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-secondary)]">
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id} className="border-b border-[var(--border-color)] hover:bg-[var(--border-subtle)]/40 text-sm">
                  <td className="p-4 font-semibold">{r.title}</td>
                  <td className="p-4">
                    <span className="badge badge-purple text-[10px] uppercase font-bold">{r.type}</span>
                  </td>
                  <td className="p-4">
                    {r.isApproved ? (
                      <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Approved
                      </span>
                    ) : (
                      <button onClick={() => handleApprove(r._id)} className="btn btn-secondary py-1 px-2.5 text-[10px] uppercase font-bold">Approve</button>
                    )}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(r._id)} className="p-1 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
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

import { useState, useEffect } from 'react';
import { adminAPI } from '../api/services';
import { Plus, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming Language');
  const [difficulty, setDifficulty] = useState('beginner');
  const [priorityScore, setPriorityScore] = useState(50);
  const [estimatedHours, setEstimatedHours] = useState(30);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSkills({ limit: 100 });
      setSkills(res.data.data.skills || []);
    } catch (err) {
      toast.error('Failed to load skills catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createSkill({ name, category, difficulty, priorityScore, estimatedHours });
      toast.success('Skill added to catalog! 🚀');
      setName('');
      setShowAddForm(false);
      fetchSkills();
    } catch (err) {
      toast.error('Failed to add skill');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill from master catalog?')) return;
    try {
      await adminAPI.deleteSkill(id);
      toast.success('Skill deleted');
      fetchSkills();
    } catch (err) {
      toast.error('Failed to delete skill');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black font-display">Manage Master Skills Catalog</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Add, update, or remove master level skills for curriculum mapping.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Create Skill
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4 max-w-xl shadow-sm">
          <h3 className="font-display font-bold text-base">Create Master Skill Reference</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Terraform" className="input" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="Programming Language">Programming Language</option>
                <option value="Framework">Framework</option>
                <option value="Database">Database</option>
                <option value="Cloud">Cloud</option>
                <option value="DevOps">DevOps</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full py-2.5 mt-2">Save Skill</button>
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
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s._id} className="border-b border-[var(--border-color)] hover:bg-[var(--border-subtle)]/40 text-sm">
                  <td className="p-4 font-semibold">{s.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{s.category}</td>
                  <td className="p-4">
                    <span className="badge badge-primary text-[10px] uppercase font-bold">{s.difficulty}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(s._id)} className="p-1 hover:text-red-500">
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

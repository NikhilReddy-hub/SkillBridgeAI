import { useState, useEffect } from 'react';
import { studentAPI } from '../api/services';
import { Plus, Trash2, Edit2, Info, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Programming Language', 'Framework', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Soft Skill', 'Tool', 'Cyber Security', 'Mobile', 'Other'
];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming Language');
  const [proficiency, setProficiency] = useState('beginner');
  const [selfRating, setSelfRating] = useState(5);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);

  // Edit states
  const [editId, setEditId] = useState(null);
  const [editProficiency, setEditProficiency] = useState('beginner');
  const [editSelfRating, setEditSelfRating] = useState(5);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getSkills();
      setSkills(res.data.data.skills);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your skills catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Skill name is required');
      return;
    }
    try {
      await studentAPI.addSkill({ name, category, proficiency, selfRating, yearsOfExperience });
      toast.success(`Added ${name} successfully!`);
      setName('');
      setShowAddForm(false);
      fetchSkills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      await studentAPI.updateSkill(id, { proficiency: editProficiency, selfRating: editSelfRating });
      toast.success('Skill updated successfully');
      setEditId(null);
      fetchSkills();
    } catch (err) {
      toast.error('Failed to update skill');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await studentAPI.deleteSkill(id);
      toast.success('Skill removed');
      fetchSkills();
    } catch (err) {
      toast.error('Failed to delete skill');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black font-display">My Skills Inventory</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage and track your technical competencies and soft skills.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Add Skill
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4 max-w-xl">
          <h3 className="font-display font-bold text-lg">Add New Skill</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Skill Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Docker, Vue.js, Tailwind" className="input" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Proficiency</label>
              <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Self Rating (1-10)</label>
              <input type="number" min="1" max="10" value={selfRating} onChange={(e) => setSelfRating(Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Years of Exp</label>
              <input type="number" min="0" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(Number(e.target.value))} className="input" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary py-2 text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary py-2 text-xs">Save Skill</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
          <Info className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-2" />
          <h3 className="font-bold text-lg">No skills cataloged</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Start by adding your current programming languages, frameworks, or database skills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((s) => {
            const isEditing = editId === s._id;
            return (
              <div key={s._id} className="card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="badge badge-primary text-[10px] uppercase font-bold">{s.category}</span>
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <button onClick={() => handleSaveEdit(s._id)} className="p-1 hover:text-emerald-500">
                          <Save className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditId(s._id);
                            setEditProficiency(s.proficiency);
                            setEditSelfRating(s.selfRating);
                          }}
                          className="p-1 hover:text-[var(--primary-500)]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(s._id)} className="p-1 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg mt-2">{s.name}</h3>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">Proficiency</span>
                      {isEditing ? (
                        <select value={editProficiency} onChange={(e) => setEditProficiency(e.target.value)} className="input py-0.5 text-xs w-28">
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      ) : (
                        <span className="font-bold text-[var(--primary-600)] capitalize">{s.proficiency}</span>
                      )}
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">Confidence level</span>
                      {isEditing ? (
                        <input type="number" min="1" max="10" value={editSelfRating} onChange={(e) => setEditSelfRating(Number(e.target.value))} className="input py-0.5 text-xs w-16" />
                      ) : (
                        <span className="font-bold">{s.selfRating}/10</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.selfRating * 10}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

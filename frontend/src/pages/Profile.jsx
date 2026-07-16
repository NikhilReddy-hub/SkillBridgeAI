import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../api/services';
import { User, Mail, GraduationCap, Building2, Link, FileText, Upload, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CAREERS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst',
  'Data Scientist', 'Java Developer', 'Python Developer', 'Cloud Engineer',
  'DevOps Engineer', 'AI Engineer', 'Cyber Security', 'Mobile Developer'
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentAPI.getProfile();
        setProfile(res.data.data.user);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await studentAPI.updateProfile(profile);
      updateUser(res.data.data.user);
      toast.success('Profile saved successfully! 💾');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      toast.loading('Uploading and parsing resume PDF...', { id: 'pdf' });
      await studentAPI.uploadResume(formData);
      toast.success('Resume parsed & saved! 📄', { id: 'pdf' });
      setFile(null);
      // Reload profile
      const res = await studentAPI.getProfile();
      setProfile(res.data.data.user);
      updateUser(res.data.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume upload failed', { id: 'pdf' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-2xl font-black font-display">Profile & Career Settings</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Full Name</label>
              <input type="text" value={profile.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Target Career Role</label>
              <select value={profile.targetCareer || ''} onChange={(e) => handleInputChange('targetCareer', e.target.value)} className="input">
                <option value="">Select Target Role</option>
                {CAREERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">College/University</label>
              <input type="text" value={profile.college || ''} onChange={(e) => handleInputChange('college', e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Branch of Study</label>
              <input type="text" value={profile.branch || ''} onChange={(e) => handleInputChange('branch', e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">Graduation Year</label>
              <input type="number" value={profile.graduationYear || ''} onChange={(e) => handleInputChange('graduationYear', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)] block mb-1">CGPA</label>
              <input type="number" step="0.01" min="0" max="10" value={profile.cgpa || ''} onChange={(e) => handleInputChange('cgpa', Number(e.target.value))} className="input" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full py-3">
            <Save className="h-4.5 w-4.5" /> {saving ? 'Saving changes...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Resume Upload Module */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-display font-bold text-lg">My Professional Resume</h3>
        <p className="text-xs text-[var(--text-secondary)]">Upload your latest PDF resume to run an automated skill gap compatibility checklist.</p>
        
        {profile.resumeUrl ? (
          <div className="flex gap-3 items-center bg-[var(--border-subtle)] p-4 rounded-xl border border-[var(--border-color)]">
            <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold block truncate">Resume Loaded</span>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--primary-600)] hover:underline truncate block">View Resume file</a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-xs p-3.5 rounded-xl border border-amber-200">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <p>No resume uploaded. AI matching is limited to manual skills.</p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="resume-file" />
          <label htmlFor="resume-file" className="btn btn-secondary w-full py-3 cursor-pointer">
            <Upload className="h-4 w-4" /> {file ? file.name : 'Choose PDF File'}
          </label>
          {file && (
            <button onClick={handleUploadResume} disabled={uploading} className="btn btn-primary w-full py-3">
              Process & Match Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

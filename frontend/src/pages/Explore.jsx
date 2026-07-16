import { useState, useEffect } from 'react';
import { searchAPI } from '../api/services';
import { Search, SlidersHorizontal, BookOpen, Compass, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState(''); // 'skill' or 'role' or 'resource'
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter search query');
      return;
    }
    setLoading(true);
    try {
      const res = await searchAPI.search(query, { type, difficulty, category });
      setResults(res.data.data);
    } catch (err) {
      toast.error('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim().length > 1) {
      const delayDebounce = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [query, type, difficulty, category]);

  return (
    <div className="space-y-8">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
        <h2 className="text-2xl font-black font-display">Global Career Resource Hub</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Search the master list of skills, learning modules, or job role requirement parameters.</p>
      </div>

      {/* Search and filter tools */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for skills, career paths, tools, libraries..."
              className="input pl-12"
            />
          </div>
          <button type="submit" className="btn btn-primary px-6">Search</button>
        </form>

        <div className="flex gap-4 items-center flex-wrap pt-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-[var(--text-secondary)] shrink-0" />
          
          <select value={type} onChange={(e) => setType(e.target.value)} className="input py-1 text-xs w-40">
            <option value="">All Formats</option>
            <option value="skill">Skills Catalog</option>
            <option value="role">Career Roles</option>
            <option value="resource">Study Materials</option>
          </select>

          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input py-1 text-xs w-36">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-500)] border-t-transparent"></div>
        </div>
      ) : !results ? (
        <div className="text-center py-12 text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
          <Compass className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm">Type a search term above to scan the ecosystem catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Job Roles */}
          {results.jobRoles?.length > 0 && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-lg border-b border-[var(--border-color)] pb-2">Matching Career Paths</h3>
              <div className="space-y-4">
                {results.jobRoles.map((role) => (
                  <div key={role.title} className="p-4 bg-[var(--border-subtle)] border border-[var(--border-color)] rounded-xl">
                    <div className="flex gap-2.5 items-center">
                      <span className="text-2xl">{role.icon || '💼'}</span>
                      <h4 className="font-bold text-sm">{role.title}</h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 line-clamp-2">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {results.skills?.length > 0 && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-lg border-b border-[var(--border-color)] pb-2">Matching Skills</h3>
              <div className="space-y-4">
                {results.skills.map((s) => (
                  <div key={s.name} className="flex justify-between items-center p-3.5 bg-[var(--border-subtle)] border border-[var(--border-color)] rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm">{s.name}</h4>
                      <span className="text-[10px] text-[var(--text-secondary)]">{s.category}</span>
                    </div>
                    <span className="badge badge-primary text-[10px] uppercase font-bold">{s.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {results.resources?.length > 0 && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl md:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-lg border-b border-[var(--border-color)] pb-2">Matching Study Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.resources.map((r) => (
                  <div key={r.title} className="flex justify-between items-start p-4 bg-[var(--border-subtle)] border border-[var(--border-color)] rounded-xl">
                    <div className="space-y-1.5">
                      <span className="badge badge-purple text-[9px] uppercase font-bold">{r.type}</span>
                      <h4 className="font-bold text-sm">{r.title}</h4>
                      <span className="text-[10px] text-[var(--text-secondary)] block">Provider: {r.provider} | {r.estimatedHours} hrs</span>
                    </div>
                    <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-secondary p-2.5 rounded-lg">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

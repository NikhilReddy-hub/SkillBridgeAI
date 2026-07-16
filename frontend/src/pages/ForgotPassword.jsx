import { useState } from 'react';
import { authAPI } from '../api/services';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6 py-12 hero-gradient">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-[var(--gradient-primary)] flex items-center justify-center text-white mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight">Forgot Password</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">We will email you a secure link to reset it</p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Check your email</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We've sent a password recovery link to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="btn btn-primary w-full">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-500 text-sm p-3.5 rounded-xl border border-red-200 mb-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-with-icon"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-[var(--primary-500)] hover:underline font-semibold">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User, Mail, Lock, School, GraduationCap, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { authService, RegistrationInput } from '../../services/authService';
import { Role, GradeLevel } from '../../types';

interface RegistrationScreenProps {
  initialRole?: Role;
  onRegisterSuccess: (role: Role, isStudent: boolean) => void;
  onGoToLogin: () => void;
  onBack: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  initialRole = 'student',
  onRegisterSuccess,
  onGoToLogin,
  onBack,
}) => {
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('Agege Comprehensive Senior High, Lagos');
  const [grade, setGrade] = useState<GradeLevel>('SS2');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const input: RegistrationInput = {
      name,
      username,
      email,
      password,
      role,
      grade,
      school,
    };

    const res = await authService.register(input);
    setIsLoading(false);

    if (res.success && res.user) {
      onRegisterSuccess(res.user.role, res.user.role === 'student');
    } else {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  const handleAutofillDemo = () => {
    setName('Babatunde Adeleke');
    setUsername('babatunde_a');
    setEmail('babatunde.adeleke@student.ng');
    setPassword('student123');
    setGrade('SS2');
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 animate-fade-in space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono font-medium text-indigo-400">
          Join MindTrace · Offline First
        </span>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Create Your Learner Profile
        </h1>
        <p className="text-xs text-slate-400">
          Start diagnosing and eliminating mathematical misconceptions today
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5">
        {/* Role toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              role === 'teacher' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Teacher
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <User className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!username) {
                  setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }
              }}
              placeholder="e.g. Aminat Diallo"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Username (Pseudonym for leaderboard)</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <span className="text-xs text-slate-500 font-mono">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="aminat_diallo"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email or Phone Number</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Mail className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu.ng"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        {role === 'student' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Class</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden cursor-pointer"
              >
                <option value="SS1">SS1 (Senior Sec 1)</option>
                <option value="SS2">SS2 (Senior Sec 2)</option>
                <option value="SS3">SS3 (Senior Sec 3)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Track</label>
              <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold">
                WAEC & JAMB
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Creating Account...' : 'Continue to Profile Setup'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Autofill Sample Student Credentials
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-white transition cursor-pointer">
          ← Back
        </button>
        <div className="space-x-1">
          <span>Already registered?</span>
          <button
            onClick={onGoToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

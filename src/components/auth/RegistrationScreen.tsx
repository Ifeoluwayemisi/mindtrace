import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Key } from 'lucide-react';
import { authService, RegistrationInput, TEACHER_ACCREDITATION_CODE } from '../../services/authService';
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
  const [showPassword, setShowPassword] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');
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
      grade: role === 'student' ? grade : undefined,
      school,
      teacherAccreditationCode: role === 'teacher' ? teacherCode : undefined,
    };

    const res = await authService.register(input);
    setIsLoading(false);

    if (res.success && res.user) {
      onRegisterSuccess(res.user.role, res.user.role === 'student');
    } else {
      setErrorMessage(res.message || 'Registration failed. Please check the fields and try again.');
    }
  };

  const handleAutofillStudent = () => {
    setName('Babatunde Adeleke');
    setUsername('babatunde_a');
    setEmail('babatunde.adeleke@student.ng');
    setPassword('student123');
    setGrade('SS2');
    setRole('student');
  };

  const handleAutofillTeacher = () => {
    setName('Mrs. Folashade Adeyemi');
    setUsername('f_adeyemi');
    setEmail('f.adeyemi@school.edu.ng');
    setPassword('teacher123');
    setTeacherCode(TEACHER_ACCREDITATION_CODE);
    setRole('teacher');
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 py-6 animate-fade-in space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Cryptographic Vault · Offline Ready</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Create Your {role === 'student' ? 'Learner' : 'Teacher'} Profile
        </h1>
        <p className="text-xs text-slate-400">
          {role === 'student'
            ? 'Start identifying and correcting algebraic misconceptions with zero data cost.'
            : 'Access diagnostic analytics and student progress across WAEC curriculum modules.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* Role Segmented Switcher */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">I am registering as a:</label>
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                role === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Secondary Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                role === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mathematics Teacher
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <User className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!username) {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                }
              }}
              placeholder="e.g. Aminat Diallo"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Username <span className="text-slate-500 font-normal">(Leaderboard Pseudonym)</span>
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <span className="text-xs text-slate-500 font-mono">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="aminat_math"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* School Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Mail className="w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu.ng"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        {role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Class Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden cursor-pointer"
              >
                <option value="SS1">SS1 (Senior Sec 1)</option>
                <option value="SS2">SS2 (Senior Sec 2)</option>
                <option value="SS3">SS3 (Senior Sec 3)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Curriculum</label>
              <div className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-semibold truncate">
                WAEC & JAMB
              </div>
            </div>
          </div>
        )}

        {/* Teacher Accreditation Code Gate */}
        {role === 'teacher' && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Teacher Accreditation Code:</span>
              </label>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
              <input
                type="text"
                required
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                placeholder="e.g. MINDTRACE-TEACHER-2026"
                className="w-full bg-transparent font-mono text-xs text-amber-300 placeholder:text-slate-600 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              For hackathon testing, enter <code className="text-amber-300 font-mono font-bold">MINDTRACE-TEACHER-2026</code>.
            </p>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Hashing & Creating Account...' : role === 'student' ? 'Continue to Profile Setup' : 'Create Teacher Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Sample Fill for Hackathon Evaluators */}
        <div className="pt-2 text-center flex items-center justify-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={handleAutofillStudent}
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Autofill Student Sample
          </button>
          <span className="text-slate-600">·</span>
          <button
            type="button"
            onClick={handleAutofillTeacher}
            className="text-violet-400 hover:text-violet-300 cursor-pointer"
          >
            Autofill Teacher Sample
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


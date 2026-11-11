import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Key, School, BookOpen } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [subjects, setSubjects] = useState('Mathematics');
  const [school, setSchool] = useState(role === 'teacher' ? '' : 'Independent Learner');
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
      designation: role === 'teacher' ? designation : undefined,
      subjects: role === 'teacher' ? subjects : undefined,
      verificationToken: role === 'teacher' && teacherCode.trim() ? teacherCode.trim() : undefined,
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
    setTeacherCode('');
    setRole('teacher');
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 py-6 animate-fade-in space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F1FF] border border-[#E4E0FD] text-xs font-bold text-[#5140CA]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6755E8]" />
          <span>Local Cryptographic Vault · Offline Ready</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-[#252641]">
          Create Your {role === 'student' ? 'Learner' : 'Teacher'} Profile
        </h1>
        <p className="text-xs text-[#74788E]">
          {role === 'student'
            ? 'Start identifying and correcting algebraic misconceptions with zero data cost.'
            : 'Access diagnostic analytics and student progress across WAEC curriculum modules.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1EE] border border-[#FDDDD7] text-[#D64D31] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-4">
        {/* Role Segmented Switcher */}
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">I am registering as a:</label>
          <div className="flex items-center p-1 rounded-xl bg-[#F5F6FC] border border-[#E9EAF3]">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                role === 'student'
                  ? 'bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white shadow-xs'
                  : 'text-[#74788E] hover:text-[#252641]'
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                role === 'teacher'
                  ? 'bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white shadow-xs'
                  : 'text-[#74788E] hover:text-[#252641]'
              }`}
            >
              Mathematics Teacher
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">Full Name</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <User className="w-4 h-4 text-[#74788E]" />
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
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">
            Username <span className="text-[#74788E] font-normal">(Leaderboard Pseudonym)</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <span className="text-xs text-[#74788E] font-mono">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="aminat_math"
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
          </div>
        </div>

        {/* School Email */}
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">Email Address</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <Mail className="w-4 h-4 text-[#74788E]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu.ng"
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        {role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">Class Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs font-semibold text-[#252641] focus:outline-hidden focus:border-[#6755E8] cursor-pointer"
              >
                <option value="SS1">SS1 (Senior Sec 1)</option>
                <option value="SS2">SS2 (Senior Sec 2)</option>
                <option value="SS3">SS3 (Senior Sec 3)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">Target Curriculum</label>
              <div className="px-3 py-2.5 rounded-xl bg-[#E8F8F4] border border-[#CEEFE6] text-xs text-[#1B886B] font-bold truncate">
                WAEC & JAMB
              </div>
            </div>
          </div>
        )}

        {/* School Accreditation Token (Optional) */}
        {role === 'teacher' && (
          <div className="space-y-4">
            {/* Professional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#252641] mb-1.5">Designation</label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
                  <User className="w-4 h-4 text-[#74788E]" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Math Lead"
                    className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#252641] mb-1.5">Subject(s)</label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
                  <BookOpen className="w-4 h-4 text-[#74788E]" />
                  <input
                    type="text"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="e.g. Mathematics, Further Math"
                    className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">School / Institution</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
                <School className="w-4 h-4 text-[#74788E]" />
                <input
                  type="text"
                  required={role === 'teacher'}
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Agege Senior High"
                  className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3F1FF] border border-[#E4E0FD] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#5140CA] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#B27B08]" />
                  <span>School Accreditation Token (Optional)</span>
                </label>
                <span className="text-[10px] text-[#74788E] font-medium">Admin-issued</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#D4D7E8] focus-within:border-[#6755E8]">
                <input
                  type="text"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. MTR-XXXX-XXXX"
                  className="w-full bg-transparent font-mono text-xs text-[#5140CA] font-bold placeholder:text-[#94A3B8] focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-[#74788E] leading-normal">
                If your school administrator issued an accreditation token, enter it for instant verification. Otherwise, your account will be created with <span className="text-[#B27B08] font-bold">Pending Verification</span> status.
              </p>
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">Password</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <Lock className="w-4 h-4 text-[#74788E]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#74788E] hover:text-[#252641] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-xs shadow-md shadow-[#6755E8]/30 transition cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Hashing & Creating Account...' : role === 'student' ? 'Continue to Profile Setup' : 'Create Teacher Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Sample Fill for Hackathon Evaluators */}
        <div className="pt-2 text-center flex items-center justify-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={handleAutofillStudent}
            className="text-[#6755E8] hover:text-[#5140CA] font-bold cursor-pointer"
          >
            Autofill Student Sample
          </button>
          <span className="text-[#E9EAF3]">·</span>
          <button
            type="button"
            onClick={handleAutofillTeacher}
            className="text-[#5140CA] hover:text-[#6755E8] font-bold cursor-pointer"
          >
            Autofill Teacher Sample
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-[#74788E]">
        <button onClick={onBack} className="hover:text-[#252641] font-semibold transition cursor-pointer">
          ← Back
        </button>
        <div className="space-x-1">
          <span>Already registered?</span>
          <button
            onClick={onGoToLogin}
            className="text-[#6755E8] hover:text-[#5140CA] font-bold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

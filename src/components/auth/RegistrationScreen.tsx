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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-bold text-[#1D4ED8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Local Cryptographic Vault · Offline Ready</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-[#0F172A]">
          Create Your {role === 'student' ? 'Learner' : 'Teacher'} Profile
        </h1>
        <p className="text-xs text-[#475569]">
          {role === 'student'
            ? 'Start identifying and correcting algebraic misconceptions with zero data cost.'
            : 'Access diagnostic analytics and student progress across WAEC curriculum modules.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="p-7 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
        {/* Role Segmented Switcher */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">I am registering as a:</label>
          <div className="flex items-center p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                role === 'student'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
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
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Mathematics Teacher
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Full Name</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
            <User className="w-4 h-4 text-[#475569]" />
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
              className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Username <span className="text-[#475569] font-normal">(Leaderboard Pseudonym)</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
            <span className="text-xs text-[#475569] font-mono">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="aminat_math"
              className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* School Email */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Email Address</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
            <Mail className="w-4 h-4 text-[#475569]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu.ng"
              className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        {role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Class Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] focus:border-[#2563EB] cursor-pointer"
              >
                <option value="SS1">SS1 (Senior Sec 1)</option>
                <option value="SS2">SS2 (Senior Sec 2)</option>
                <option value="SS3">SS3 (Senior Sec 3)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Target Curriculum</label>
              <div className="px-3 py-2.5 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-xs text-[#065F46] font-bold truncate">
                WAEC & JAMB
              </div>
            </div>
          </div>
        )}

        {/* Teacher Specific Fields */}
        {role === 'teacher' && (
          <div className="space-y-4">
            {/* Professional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Designation</label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
                  <User className="w-4 h-4 text-[#475569]" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Math Lead"
                    className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Subject(s)</label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
                  <BookOpen className="w-4 h-4 text-[#475569]" />
                  <input
                    type="text"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="e.g. Mathematics, Further Math"
                    className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">School / Institution</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
                <School className="w-4 h-4 text-[#475569]" />
                <input
                  type="text"
                  required={role === 'teacher'}
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Agege Senior High"
                  className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#4338CA] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>School Accreditation Token (Optional)</span>
                </label>
                <span className="text-[10px] text-[#475569] font-medium">Admin-issued</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] focus-within:border-[#2563EB]">
                <input
                  type="text"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. MTR-XXXX-XXXX"
                  className="w-full bg-transparent font-mono text-xs text-[#2563EB] font-bold placeholder:text-[#94A3B8]"
                />
              </div>
              <p className="text-[11px] text-[#475569] leading-normal">
                If your school administrator issued an accreditation token, enter it for instant verification. Otherwise, your account will be created with <span className="text-[#92400E] font-bold">Pending Verification</span> status.
              </p>
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Password</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
            <Lock className="w-4 h-4 text-[#475569]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#475569] hover:text-[#0F172A] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm shadow-[#2563EB]/25 transition cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Hashing & Creating Account...' : role === 'student' ? 'Continue to Profile Setup' : 'Create Teacher Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Sample Fill for Hackathon Evaluators */}
        <div className="pt-2 text-center flex items-center justify-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={handleAutofillStudent}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer"
          >
            Autofill Student Sample
          </button>
          <span className="text-[#E2E8F0]">·</span>
          <button
            type="button"
            onClick={handleAutofillTeacher}
            className="text-[#0EA5E9] hover:text-[#0369A1] font-bold cursor-pointer"
          >
            Autofill Teacher Sample
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-[#475569]">
        <button onClick={onBack} className="hover:text-[#0F172A] font-semibold transition cursor-pointer">
          ← Back
        </button>
        <div className="space-x-1">
          <span>Already registered?</span>
          <button
            onClick={onGoToLogin}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

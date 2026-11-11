import React, { useState } from 'react';
import {
  User,
  Settings,
  Shield,
  Database,
  Upload,
  Check,
  CheckCircle2,
  Lock,
  Volume2,
  Eye,
  Sliders,
  Sparkles,
  LogOut,
  RefreshCw,
  Download,
} from 'lucide-react';
import { StudentProfile, LearningPreference, GradeLevel, ExamTrack } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface StudentProfileViewProps {
  student: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onLogout: () => void;
}

const PRESET_AVATARS = [
  { id: 'AVATAR_M1', label: 'Tunde', path: '/src/assets/images/student_avatar_male_1_1794394444739.jpg' },
  { id: 'AVATAR_F1', label: 'Aminat', path: '/src/assets/images/student_avatar_female_1_1794394445859.jpg' },
  { id: 'AVATAR_M2', label: 'Chidi', path: '/src/assets/images/student_avatar_male_2_1794394446145.jpg' },
  { id: 'AVATAR_F2', label: 'Ngozi', path: '/src/assets/images/student_avatar_female_2_1794394447322.jpg' },
  { id: 'AVATAR_M3', label: 'Segun', path: '/src/assets/images/student_avatar_male_3_1794394447398.jpg' },
  { id: 'AVATAR_F3', label: 'Folashade', path: '/src/assets/images/student_avatar_female_3_1794394447853.jpg' },
  { id: 'AVATAR_M4', label: 'Babatunde', path: '/src/assets/images/student_avatar_male_4_1794394448086.jpg' },
  { id: 'AVATAR_F4', label: 'Zainab', path: '/src/assets/images/student_avatar_female_4_1794394449400.jpg' },
];

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onProfileUpdated,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'privacy' | 'storage'>('profile');

  // Form states
  const [name, setName] = useState(student.name);
  const [username, setUsername] = useState(student.username || 'aminat_diallo');
  const [grade, setGrade] = useState<GradeLevel>(student.grade);
  const [targetExam, setTargetExam] = useState<ExamTrack>(student.targetExam);
  const [preferredPresentation, setPreferredPresentation] = useState<LearningPreference[]>(
    student.preferredPresentation || student.learningPreferences || ['visual', 'interactive']
  );
  const [audioSupport, setAudioSupport] = useState<boolean>(
    student.audioSupport ??
      (student.preferredPresentation?.includes('audio') ||
        student.learningPreferences?.includes('audio') ||
        false)
  );
  const [leaderboardOptIn, setLeaderboardOptIn] = useState<boolean>(student.leaderboardOptIn ?? true);

  const [avatarSeed, setAvatarSeed] = useState(student.avatarSeed);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const togglePresentation = (pref: LearningPreference) => {
    if (pref === 'audio') {
      const nextAudio = !audioSupport;
      setAudioSupport(nextAudio);
      if (nextAudio) {
        if (!preferredPresentation.includes('audio')) {
          setPreferredPresentation([...preferredPresentation, 'audio']);
        }
      } else {
        setPreferredPresentation(preferredPresentation.filter((p) => p !== 'audio'));
      }
      return;
    }

    if (preferredPresentation.includes(pref)) {
      if (preferredPresentation.length > 1) {
        setPreferredPresentation(preferredPresentation.filter((p) => p !== pref));
      }
    } else {
      setPreferredPresentation([...preferredPresentation, pref]);
    }
  };

  const handleSaveProfile = async () => {
    const finalPresentation = preferredPresentation.filter((p) => audioSupport || p !== 'audio');
    if (audioSupport && !finalPresentation.includes('audio')) {
      finalPresentation.push('audio');
    }

    const updated: StudentProfile = {
      ...student,
      name,
      username,
      grade,
      targetExam,
      avatarSeed,
      preferredPresentation: finalPresentation,
      audioSupport,
      learningPreferences: finalPresentation,
      leaderboardOptIn,
      classSection: `${grade} B`,
    };

    await storageService.saveStudentProfile(updated);
    onProfileUpdated(updated);
    triggerToast('Profile changes saved locally');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      triggerToast('Avatar image size must be under 1 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarSeed(reader.result as string);
      triggerToast('Custom avatar updated successfully');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#6755E8] text-white shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#49C6A3]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner Overview */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-[#F3F1FF] border-2 border-[#6755E8] flex items-center justify-center font-bold text-white text-xl overflow-hidden shadow-sm shrink-0">
            <img 
              src={avatarSeed} 
              alt="" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="w-full h-full flex items-center justify-center font-display text-2xl font-bold text-white bg-[#6755E8]">
              {name.substring(0, 2).toUpperCase() || 'MT'}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold text-[#252641]">{student.name}</h1>
            <p className="text-xs text-[#5140CA] font-mono font-bold">@{student.username}</p>
            <p className="text-xs text-[#74788E] mt-0.5">
              {student.classSection} · {student.school} · {student.targetExam} Target
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F6FC] hover:bg-[#FFF1EE] hover:text-[#D64D31] hover:border-[#FF9078] border border-[#E9EAF3] text-xs font-bold text-[#74788E] transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Profile / Sign Out</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F5F6FC] border border-[#E9EAF3] rounded-xl w-fit">
        <button
          onClick={() => setActiveSection('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'profile' ? 'bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white shadow-xs' : 'text-[#74788E] hover:text-[#252641]'
          }`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'preferences' ? 'bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white shadow-xs' : 'text-[#74788E] hover:text-[#252641]'
          }`}
        >
          Presentation Styles
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'privacy' ? 'bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white shadow-xs' : 'text-[#74788E] hover:text-[#252641]'
          }`}
        >
          Privacy & Leaderboard
        </button>
        <button
          onClick={() => setActiveSection('storage')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'storage' ? 'bg-gradient-to-r from-[#6755E8] to-[#5140CA] text-white shadow-xs' : 'text-[#74788E] hover:text-[#252641]'
          }`}
        >
          Offline Storage & Sync
        </button>
      </div>

      {/* Section 1: Personal Info & Avatar */}
      {activeSection === 'profile' && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-[#252641]">Edit Student Details</h2>
            <p className="text-xs text-[#74788E]">Update your school information and avatar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs text-[#252641] focus:outline-hidden focus:border-[#6755E8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] font-mono text-xs text-[#252641] font-bold focus:outline-hidden focus:border-[#6755E8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">Class Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs font-semibold text-[#252641] focus:outline-hidden focus:border-[#6755E8] cursor-pointer"
              >
                <option value="SS1">SS1</option>
                <option value="SS2">SS2</option>
                <option value="SS3">SS3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">Target Exam</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as ExamTrack)}
                className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs font-semibold text-[#252641] focus:outline-hidden focus:border-[#6755E8] cursor-pointer"
              >
                <option value="WAEC">WAEC General Mathematics</option>
                <option value="JAMB">JAMB UTME</option>
                <option value="NECO">NECO Senior Mathematics</option>
              </select>
            </div>
          </div>

          {/* Change Avatar */}
          <div className="pt-3 border-t border-[#E9EAF3] space-y-3">
            <label className="block text-xs font-bold text-[#252641]">Choose Peer Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setAvatarSeed(av.path)}
                  className={`group relative p-1 rounded-2xl border transition-all cursor-pointer ${
                    avatarSeed === av.path ? 'border-[#6755E8] bg-[#F3F1FF] ring-2 ring-[#6755E8]/30' : 'border-[#E9EAF3] bg-[#F8F9FF] hover:border-[#6755E8]/40'
                  }`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-2xs">
                    <img
                      src={av.path}
                      alt={av.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {avatarSeed === av.path && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#6755E8] flex items-center justify-center shadow-sm border border-white">
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                  )}
                  <span className="text-[9px] font-bold text-[#74788E] mt-1.5 block truncate px-0.5">{av.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D4D7E8] bg-[#F8F9FF] hover:bg-[#F3F1FF] text-xs font-semibold text-[#252641] cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-[#6755E8]" />
                <span>Upload New Avatar Picture</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E9EAF3] flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-xs shadow-md shadow-[#6755E8]/30 transition cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* Section 2: Presentation Preferences */}
      {activeSection === 'preferences' && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-[#252641]">Learning Presentation Preferences</h2>
            <p className="text-xs text-[#74788E] mt-0.5">
              Customize how mathematical explanations and step-by-step remedies are delivered to you.
            </p>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => togglePresentation('visual')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                preferredPresentation.includes('visual') ? 'bg-[#F3F1FF] border-[#6755E8] shadow-xs' : 'bg-[#F8F9FF] border-[#E9EAF3] hover:border-[#D4D7E8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAE6FE] text-[#6755E8] flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#252641]">Visual Diagrams & Comparison Tables</h3>
                  <p className="text-[11px] text-[#74788E]">Step transitions highlighted with side-by-side math formulas.</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${preferredPresentation.includes('visual') ? 'bg-[#6755E8] border-[#6755E8] text-white' : 'border-[#D4D7E8]'}`}>
                {preferredPresentation.includes('visual') && <Check className="w-3 h-3" />}
              </div>
            </div>

            {/* Audio Read-Aloud Assistance Card with Explicit Toggle */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                audioSupport
                  ? 'bg-[#F3F1FF] border-[#6755E8] shadow-xs'
                  : 'bg-[#F8F9FF] border-[#E9EAF3]'
              }`}
            >
              <div
                onClick={() => togglePresentation('audio')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F8F4] text-[#1B886B] flex items-center justify-center shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#252641]">Audio Read-Aloud Assistance</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8F8F4] text-[#1B886B] border border-[#CEEFE6]">
                        Zero Data
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74788E] mt-0.5">
                      Spoken problem statements, step directions, and diagnostic explanations using browser speech.
                    </p>
                  </div>
                </div>

                {/* Explicit Audio Assistance Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${audioSupport ? 'text-[#1B886B]' : 'text-[#74788E]'}`}>
                    {audioSupport ? 'Enabled' : 'Disabled'}
                  </span>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      audioSupport ? 'bg-[#6755E8]' : 'bg-[#D4D7E8]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        audioSupport ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Live Audio Read-Aloud Tester */}
              <div className="pt-2 border-t border-[#E9EAF3]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-[#252641] font-bold">
                    Voice Preview & Controls Test:
                  </span>
                  <span className="text-[10px] text-[#74788E]">
                    Tested via native Web Speech API
                  </span>
                </div>
                <AudioPlayerControl
                  textToSpeak="MindTrace audio read-aloud assistance is enabled. You can pause, resume, and replay explanations at any time during practice."
                  label="Test Audio Playback"
                  variant="card"
                  hasAudioPreference={audioSupport}
                />
              </div>
            </div>

            <div
              onClick={() => togglePresentation('interactive')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                preferredPresentation.includes('interactive') ? 'bg-[#F3F1FF] border-[#6755E8] shadow-xs' : 'bg-[#F8F9FF] border-[#E9EAF3] hover:border-[#D4D7E8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF8FB] text-[#167E96] flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#252641]">Interactive Hands-On Manipulatives</h3>
                  <p className="text-[11px] text-[#74788E]">Manipulate balance scale pans and rainbow brackets with sliders.</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${preferredPresentation.includes('interactive') ? 'bg-[#6755E8] border-[#6755E8] text-white' : 'border-[#D4D7E8]'}`}>
                {preferredPresentation.includes('interactive') && <Check className="w-3 h-3" />}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E9EAF3] flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-xs shadow-md shadow-[#6755E8]/30 transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Privacy & Leaderboard */}
      {activeSection === 'privacy' && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-[#252641]">Privacy & Leaderboard Visibility</h2>
            <p className="text-xs text-[#74788E] mt-0.5">Control how your learning activity is displayed to classmates.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F9FF] border border-[#E9EAF3] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#252641]">Show on Class Leaderboard</h3>
                <p className="text-[11px] text-[#74788E] mt-0.5">
                  When disabled, your score is hidden or displayed as "Anonymous Student".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeaderboardOptIn(!leaderboardOptIn)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  leaderboardOptIn ? 'bg-[#6755E8]' : 'bg-[#D4D7E8]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    leaderboardOptIn ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E9EAF3] flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-xs shadow-md shadow-[#6755E8]/30 transition cursor-pointer"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>
      )}

      {/* Section 4: Offline Storage & Sync */}
      {activeSection === 'storage' && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-[#252641]">Offline Data & IndexedDB Health</h2>
            <p className="text-xs text-[#74788E] mt-0.5">
              Inspect on-device diagnostic records and micro-sync queue status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8F9FF] border border-[#E9EAF3] space-y-1">
              <span className="text-[#74788E]">Database Name:</span>
              <p className="font-mono font-bold text-[#5140CA]">MindTraceOfflineDB (v2)</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8F9FF] border border-[#E9EAF3] space-y-1">
              <span className="text-[#74788E]">IndexedDB Object Stores:</span>
              <p className="font-mono text-[#252641] font-semibold">profiles, diagnoses, syncQueue, teacherAnalytics, lessonPackages</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => {
                const data = JSON.stringify(student, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mindtrace-profile-${student.username}.json`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F6FC] hover:bg-[#F3F1FF] border border-[#E9EAF3] text-xs font-bold text-[#252641] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6755E8]" />
              <span>Export Offline Profile Backup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  AlertTriangle,
} from 'lucide-react';
import { StudentProfile, LearningPreference, GradeLevel, ExamTrack } from '../../types';
import { storageService } from '../../services/storageService';
import { syncService } from '../../services/syncService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface StudentProfileViewProps {
  student: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onLogout: () => void;
}

const PRESET_AVATARS = [
  { id: 'AD', label: 'Preset A', bg: 'bg-indigo-600' },
  { id: 'BA', label: 'Preset B', bg: 'bg-emerald-600' },
  { id: 'CE', label: 'Preset C', bg: 'bg-violet-600' },
  { id: 'DO', label: 'Preset D', bg: 'bg-amber-600' },
  { id: 'EN', label: 'Preset E', bg: 'bg-cyan-600' },
  { id: 'FA', label: 'Preset F', bg: 'bg-rose-600' },
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
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner Overview */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl overflow-hidden shadow-lg">
            {avatarSeed.startsWith('data:image') ? (
              <img src={avatarSeed} alt="" className="w-full h-full object-cover" />
            ) : (
              avatarSeed
            )}
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">{student.name}</h1>
            <p className="text-xs text-indigo-400 font-mono">@{student.username}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.classSection} · {student.school} · {student.targetExam} Target
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Profile / Sign Out</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveSection('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            activeSection === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            activeSection === 'preferences' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Presentation Styles
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            activeSection === 'privacy' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Privacy & Leaderboard
        </button>
        <button
          onClick={() => setActiveSection('storage')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            activeSection === 'storage' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Offline Storage & Sync
        </button>
      </div>

      {/* Section 1: Personal Info & Avatar */}
      {activeSection === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-white">Edit Student Details</h2>
            <p className="text-xs text-slate-400">Update your school information and avatar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Class Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden cursor-pointer"
              >
                <option value="SS1">SS1</option>
                <option value="SS2">SS2</option>
                <option value="SS3">SS3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Exam</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as ExamTrack)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden cursor-pointer"
              >
                <option value="WAEC">WAEC General Mathematics</option>
                <option value="JAMB">JAMB UTME</option>
                <option value="NECO">NECO Senior Mathematics</option>
              </select>
            </div>
          </div>

          {/* Change Avatar */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Choose Peer Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setAvatarSeed(av.id)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    avatarSeed === av.id ? 'border-indigo-500 bg-indigo-950/60' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-bold text-white ${av.bg}`}>
                    {av.id}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{av.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-300 hover:text-white cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload New Avatar Picture</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* Section 2: Presentation Preferences */}
      {activeSection === 'preferences' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-white">Learning Presentation Preferences</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize how mathematical explanations and step-by-step remedies are delivered to you.
            </p>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => togglePresentation('visual')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                preferredPresentation.includes('visual') ? 'bg-indigo-950/60 border-indigo-500' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">Visual Diagrams & Comparison Tables</h3>
                  <p className="text-[11px] text-slate-400">Step transitions highlighted with side-by-side math formulas.</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${preferredPresentation.includes('visual') ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'}`}>
                {preferredPresentation.includes('visual') && <Check className="w-3 h-3" />}
              </div>
            </div>

            {/* Audio Read-Aloud Assistance Card with Explicit Toggle */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                audioSupport
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div
                onClick={() => togglePresentation('audio')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">Audio Read-Aloud Assistance</h3>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Zero Data
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Spoken problem statements, step directions, and diagnostic explanations using browser speech.
                    </p>
                  </div>
                </div>

                {/* Explicit Audio Assistance Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${audioSupport ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {audioSupport ? 'Enabled' : 'Disabled'}
                  </span>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      audioSupport ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
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
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-slate-300 font-semibold">
                    Voice Preview & Controls Test:
                  </span>
                  <span className="text-[10px] text-slate-400">
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
                preferredPresentation.includes('interactive') ? 'bg-indigo-950/60 border-indigo-500' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">Interactive Hands-On Manipulatives</h3>
                  <p className="text-[11px] text-slate-400">Manipulate balance scale pans and rainbow brackets with sliders.</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${preferredPresentation.includes('interactive') ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'}`}>
                {preferredPresentation.includes('interactive') && <Check className="w-3 h-3" />}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Privacy & Leaderboard */}
      {activeSection === 'privacy' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-white">Privacy & Leaderboard Visibility</h2>
            <p className="text-xs text-slate-400 mt-0.5">Control how your learning activity is displayed to classmates.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Show on Class Leaderboard</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When disabled, your score is hidden or displayed as "Anonymous Student".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeaderboardOptIn(!leaderboardOptIn)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  leaderboardOptIn ? 'bg-indigo-600' : 'bg-slate-700'
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

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>
      )}

      {/* Section 4: Offline Storage & Sync */}
      {activeSection === 'storage' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-display font-bold text-white">Offline Data & IndexedDB Health</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect on-device diagnostic records and micro-sync queue status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Database Name:</span>
              <p className="font-mono font-bold text-indigo-300">MindTraceOfflineDB (v2)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">IndexedDB Object Stores:</span>
              <p className="font-mono text-slate-300">profiles, diagnoses, syncQueue, teacherAnalytics, lessonPackages</p>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Offline Profile Backup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

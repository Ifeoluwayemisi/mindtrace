import React, { useState } from 'react';
import {
  User,
  Upload,
  Check,
  CheckCircle2,
  Sparkles,
  Volume2,
  Eye,
  Sliders,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile, LearningPreference, GradeLevel, ExamTrack } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface StudentProfileSetupProps {
  initialProfile: StudentProfile;
  onSetupCompleted: (updatedProfile: StudentProfile) => void;
}

const PRESET_AVATARS = [
  { id: 'AD', label: 'Aminat', bg: 'bg-indigo-600' },
  { id: 'BA', label: 'Babatunde', bg: 'bg-emerald-600' },
  { id: 'CE', label: 'Chiamaka', bg: 'bg-violet-600' },
  { id: 'DO', label: 'David', bg: 'bg-amber-600' },
  { id: 'EN', label: 'Emeka', bg: 'bg-cyan-600' },
  { id: 'FA', label: 'Fatimah', bg: 'bg-rose-600' },
];

export const StudentProfileSetup: React.FC<StudentProfileSetupProps> = ({
  initialProfile,
  onSetupCompleted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Profile Form States
  const [name, setName] = useState(initialProfile.name || 'Aminat Diallo');
  const [username, setUsername] = useState(initialProfile.username || 'aminat_diallo');
  const [selectedAvatar, setSelectedAvatar] = useState(initialProfile.avatarSeed || 'AD');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [grade, setGrade] = useState<GradeLevel>(initialProfile.grade || 'SS2');
  const [targetExam, setTargetExam] = useState<ExamTrack>(initialProfile.targetExam || 'WAEC');
  const [preferredPresentation, setPreferredPresentation] = useState<LearningPreference[]>(
    initialProfile.preferredPresentation || initialProfile.learningPreferences || ['visual', 'interactive']
  );
  const [audioSupport, setAudioSupport] = useState<boolean>(
    initialProfile.audioSupport ??
      (initialProfile.preferredPresentation?.includes('audio') ||
        initialProfile.learningPreferences?.includes('audio') ||
        false)
  );
  const [fileError, setFileError] = useState<string | null>(null);

  // Real-time username validation
  const isUsernameValid = username.trim().length >= 3 && /^[a-z0-9_]+$/.test(username.trim());

  // Avatar Upload Handler with file validation & size limit (<1MB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 1024 * 1024) {
      setFileError('Image file size must be under 1 MB for optimal low-bandwidth storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomAvatarUrl(dataUrl);
      setSelectedAvatar('custom');
    };
    reader.readAsDataURL(file);
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

  const handleFinish = async () => {
    const finalPresentation = preferredPresentation.filter((p) => audioSupport || p !== 'audio');
    if (audioSupport && !finalPresentation.includes('audio')) {
      finalPresentation.push('audio');
    }

    const updated: StudentProfile = {
      ...initialProfile,
      name,
      username,
      avatarSeed: customAvatarUrl || selectedAvatar,
      grade,
      targetExam,
      preferredPresentation: finalPresentation,
      audioSupport,
      learningPreferences: finalPresentation,
      classSection: `${grade} B`,
    };

    await storageService.saveStudentProfile(updated);
    onSetupCompleted(updated);
  };

  return (
    <div className="max-w-xl mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 animate-fade-in space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-indigo-400">Profile Customization</span>
        <span>Step {step} of 4</span>
      </div>

      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Avatar Selection & Upload */}
      {step === 1 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 animate-fade-in">
          <div>
            <h1 className="text-xl font-display font-bold text-white">Choose Your Avatar</h1>
            <p className="text-xs text-slate-400 mt-1">
              Select a peer avatar or upload a custom image (max 1 MB).
            </p>
          </div>

          {/* Current Avatar Preview */}
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              {customAvatarUrl ? (
                <img
                  src={customAvatarUrl}
                  alt="Custom Avatar"
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-500 shadow-lg"
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center font-display text-2xl font-bold text-white shadow-lg ${
                    PRESET_AVATARS.find((a) => a.id === selectedAvatar)?.bg || 'bg-indigo-600'
                  }`}
                >
                  {selectedAvatar}
                </div>
              )}
            </div>
          </div>

          {/* Preset Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  setSelectedAvatar(av.id);
                  setCustomAvatarUrl(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedAvatar === av.id && !customAvatarUrl
                    ? 'border-indigo-500 bg-indigo-950/60 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-xs font-bold text-white ${av.bg}`}
                >
                  {av.id}
                </div>
                <span className="text-[10px] text-slate-300 mt-1.5 block">{av.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Upload */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Or Upload Custom Profile Picture
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 text-xs text-slate-300 cursor-pointer transition">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Choose Image (PNG, JPG, max 1MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {fileError && <p className="text-[11px] text-rose-400 mt-1">{fileError}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Next: Username & Class</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Username & Educational Level */}
      {step === 2 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 animate-fade-in">
          <div>
            <h1 className="text-xl font-display font-bold text-white">Username & Educational Level</h1>
            <p className="text-xs text-slate-400 mt-1">
              Your username acts as your pseudonym on class leaderboards.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Username (@pseudonym)
                </label>
                {isUsernameValid ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Available
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400">Min 3 chars (letters, numbers, _)</span>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
                <span className="text-xs text-slate-500 font-mono">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Senior Class</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="SS1">SS1 (Senior Sec 1)</option>
                  <option value="SS2">SS2 (Senior Sec 2)</option>
                  <option value="SS3">SS3 (Senior Sec 3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Exam</label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value as ExamTrack)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="WAEC">WAEC General Math</option>
                  <option value="JAMB">JAMB UTME</option>
                  <option value="NECO">NECO Senior Math</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!isUsernameValid || name.trim().length < 2}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <span>Next: Learning Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Learning Presentation Preferences */}
      {step === 3 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 animate-fade-in">
          <div>
            <h1 className="text-xl font-display font-bold text-white">Learning Presentation Preferences</h1>
            <p className="text-xs text-slate-400 mt-1">
              Select one or multiple presentation styles. You can change these at any time in your settings.
            </p>
          </div>

          <div className="space-y-3">
            {/* Visual */}
            <div
              onClick={() => togglePresentation('visual')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                preferredPresentation.includes('visual')
                  ? 'bg-indigo-950/60 border-indigo-500'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">Visual Explanations</h3>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      preferredPresentation.includes('visual')
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-slate-700'
                    }`}
                  >
                    {preferredPresentation.includes('visual') && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Diagrams, step comparison tables, and highlighted balance transformations.
                </p>
              </div>
            </div>

            {/* Audio Support (Dedicated Boolean Flag & Presentation Mode) */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                audioSupport
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div
                onClick={() => togglePresentation('audio')}
                className="flex items-start gap-3.5 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">Audio Read-Aloud Assistance</h3>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Zero Data
                      </span>
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
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Provides spoken read-aloud for question instructions, equation steps, and diagnostic feedback using your device's native speech engine.
                  </p>
                </div>
              </div>

              {/* Interactive Audio Voice Preview Tester */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-slate-300 font-semibold">
                    Test your device voice:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Works offline if local OS voice is installed
                  </span>
                </div>
                <AudioPlayerControl
                  textToSpeak="Welcome to MindTrace. Audio read-aloud assistance is ready. I will read mathematics equations and step feedback aloud on your device."
                  label="Sample Voice Preview"
                  variant="card"
                  hasAudioPreference={audioSupport}
                />
              </div>
            </div>

            {/* Interactive */}
            <div
              onClick={() => togglePresentation('interactive')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                preferredPresentation.includes('interactive')
                  ? 'bg-indigo-950/60 border-indigo-500'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-violet-950 text-violet-400 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">Interactive Hands-On Activities</h3>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      preferredPresentation.includes('interactive')
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-slate-700'
                    }`}
                  >
                    {preferredPresentation.includes('interactive') && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Two-pan balance scale widgets, rainbow arrow builders, and interactive math keyboards.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Review & Complete</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Profile Completion & Celebration */}
      {step === 4 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-display font-extrabold text-white">Profile Ready!</h1>
            <p className="text-xs text-slate-300 mt-1">
              Your personalized mathematics diagnostic workspace is ready for offline practice.
            </p>
          </div>

          {/* Profile Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                {customAvatarUrl ? (
                  <img src={customAvatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  selectedAvatar
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">{name}</span>
                <span className="text-xs font-mono text-indigo-400">@{username}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Class & Target:</span>
                <span className="text-slate-200 font-semibold">{grade} · {targetExam}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Presentation Styles:</span>
                <span className="text-slate-200 font-semibold capitalize">
                  {[...preferredPresentation, ...(audioSupport && !preferredPresentation.includes('audio') ? ['audio'] : [])].join(', ')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Enter MindTrace Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

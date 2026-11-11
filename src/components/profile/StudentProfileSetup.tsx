import React, { useState } from 'react';
import {
  Upload,
  Check,
  CheckCircle2,
  Sparkles,
  Volume2,
  Eye,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { StudentProfile, LearningPreference, GradeLevel, ExamTrack } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';

interface StudentProfileSetupProps {
  initialProfile: StudentProfile;
  onSetupCompleted: (updatedProfile: StudentProfile) => void;
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

export const StudentProfileSetup: React.FC<StudentProfileSetupProps> = ({
  initialProfile,
  onSetupCompleted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Profile Form States
  const [name, setName] = useState(initialProfile.name || '');
  const [username, setUsername] = useState(initialProfile.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialProfile.avatarSeed || 'AVATAR_M1');
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
      learningPreferences: finalPresentation,
      classSection: `${grade} B`,
      avatarSeed: customAvatarUrl || (PRESET_AVATARS.find(a => a.id === selectedAvatar)?.path || selectedAvatar),
    };

    await storageService.saveStudentProfile(updated);
    onSetupCompleted(updated);
  };

  return (
    <div className="max-w-xl mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 animate-fade-in space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-[#74788E]">
        <span className="font-mono font-bold text-[#6755E8]">Profile Customization</span>
        <span className="font-semibold">Step {step} of 4</span>
      </div>

      <div className="w-full bg-[#E9EAF3] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#6755E8] to-[#5140CA] h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Avatar Selection & Upload */}
      {step === 1 && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-5 animate-fade-in">
          <div>
            <h1 className="text-xl font-display font-bold text-[#252641]">Choose Your Avatar</h1>
            <p className="text-xs text-[#74788E] mt-1">
              Select a peer avatar or upload a custom image (max 1 MB).
            </p>
          </div>

          {/* Current Avatar Preview */}
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              {customAvatarUrl || (selectedAvatar && !PRESET_AVATARS.some(a => a.id === selectedAvatar)) ? (
                <img
                  src={customAvatarUrl || selectedAvatar}
                  alt="Custom Avatar"
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-[#6755E8] shadow-lg shadow-[#6755E8]/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-[#6755E8] shadow-lg shadow-[#6755E8]/20 bg-[#F3F1FF]">
                  <img
                    src={PRESET_AVATARS.find((a) => a.id === selectedAvatar)?.path || ''}
                    alt="Selected Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback to initials if image fails or not found */}
                  <div className="w-full h-full flex items-center justify-center font-display text-2xl font-bold text-white bg-[#6755E8]">
                    {name.substring(0, 2).toUpperCase() || 'MT'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preset Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {PRESET_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  setSelectedAvatar(av.id);
                  setCustomAvatarUrl(null);
                }}
                className={`group relative p-1 rounded-2xl border transition-all cursor-pointer ${
                  selectedAvatar === av.id && !customAvatarUrl
                    ? 'border-[#6755E8] bg-[#F3F1FF] ring-2 ring-[#6755E8]/30'
                    : 'border-[#E9EAF3] bg-[#F8F9FF] hover:border-[#6755E8]/40'
                }`}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-2xs">
                  <img
                    src={av.path}
                    alt={av.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                {selectedAvatar === av.id && !customAvatarUrl && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#6755E8] flex items-center justify-center shadow-sm border border-white">
                    <Check className="w-3 h-3 text-white" strokeWidth={4} />
                  </div>
                )}
                <span className="text-[9px] font-bold text-[#74788E] mt-1.5 block truncate px-0.5">{av.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Upload */}
          <div className="pt-2 border-t border-[#E9EAF3]">
            <label className="block text-xs font-bold text-[#252641] mb-1.5">
              Or Upload Custom Profile Picture
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#D4D7E8] hover:border-[#6755E8] bg-[#F8F9FF] hover:bg-[#F3F1FF] text-xs text-[#252641] font-medium cursor-pointer transition">
                <Upload className="w-4 h-4 text-[#6755E8]" />
                <span>Choose Image (PNG, JPG, max 1MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {fileError && <p className="text-[11px] text-[#D64D31] font-semibold mt-1">{fileError}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white text-xs font-bold shadow-md shadow-[#6755E8]/30 transition cursor-pointer"
            >
              <span>Next: Username & Class</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Username & Educational Level */}
      {step === 2 && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-5 animate-fade-in">
          <div>
            <h1 className="text-xl font-display font-bold text-[#252641]">Username & Educational Level</h1>
            <p className="text-xs text-[#74788E] mt-1">
              Your username acts as your pseudonym on class leaderboards.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#252641] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs text-[#252641] focus:outline-hidden focus:border-[#6755E8] focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#252641]">
                  Username (@pseudonym)
                </label>
                {isUsernameValid ? (
                  <span className="text-[10px] text-[#1B886B] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Available
                  </span>
                ) : (
                  <span className="text-[10px] text-[#B27B08] font-medium">Min 3 chars (letters, numbers, _)</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white">
                <span className="text-xs text-[#74788E] font-mono">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#252641] mb-1.5">Senior Class</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs font-semibold text-[#252641] focus:outline-hidden focus:border-[#6755E8] cursor-pointer"
                >
                  <option value="SS1">SS1 (Senior Sec 1)</option>
                  <option value="SS2">SS2 (Senior Sec 2)</option>
                  <option value="SS3">SS3 (Senior Sec 3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#252641] mb-1.5">Target Exam</label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value as ExamTrack)}
                  className="w-full p-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] text-xs font-semibold text-[#252641] focus:outline-hidden focus:border-[#6755E8] cursor-pointer"
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
              className="text-xs font-bold text-[#74788E] hover:text-[#252641] transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!isUsernameValid || name.trim().length < 2}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white text-xs font-bold shadow-md shadow-[#6755E8]/30 transition cursor-pointer disabled:opacity-50"
            >
              <span>Next: Learning Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Learning Presentation Preferences */}
      {step === 3 && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-5 animate-fade-in">
          <div>
            <h1 className="text-xl font-display font-bold text-[#252641]">Learning Presentation Preferences</h1>
            <p className="text-xs text-[#74788E] mt-1">
              Select one or multiple presentation styles. You can change these at any time in your settings.
            </p>
          </div>

          <div className="space-y-3">
            {/* Visual */}
            <div
              onClick={() => togglePresentation('visual')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                preferredPresentation.includes('visual')
                  ? 'bg-[#F3F1FF] border-[#6755E8] shadow-xs'
                  : 'bg-[#F8F9FF] border-[#E9EAF3] hover:border-[#D4D7E8]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAE6FE] text-[#6755E8] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#252641]">Visual Explanations</h3>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      preferredPresentation.includes('visual')
                        ? 'bg-[#6755E8] border-[#6755E8] text-white'
                        : 'border-[#D4D7E8]'
                    }`}
                  >
                    {preferredPresentation.includes('visual') && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-[#74788E] mt-0.5">
                  Diagrams, step comparison tables, and highlighted balance transformations.
                </p>
              </div>
            </div>

            {/* Audio Support (Dedicated Boolean Flag & Presentation Mode) */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                audioSupport
                  ? 'bg-[#F3F1FF] border-[#6755E8] shadow-xs'
                  : 'bg-[#F8F9FF] border-[#E9EAF3]'
              }`}
            >
              <div
                onClick={() => togglePresentation('audio')}
                className="flex items-start gap-3.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F8F4] text-[#1B886B] flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#252641]">Audio Read-Aloud Assistance</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8F8F4] text-[#1B886B] border border-[#CEEFE6]">
                        Zero Data
                      </span>
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
                  <p className="text-[11px] text-[#74788E] mt-0.5 leading-relaxed">
                    Provides spoken read-aloud for question instructions, equation steps, and diagnostic feedback using your device's native speech engine.
                  </p>
                </div>
              </div>

              {/* Interactive Audio Voice Preview Tester */}
              <div className="pt-2 border-t border-[#E9EAF3]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] text-[#252641] font-bold">
                    Test your device voice:
                  </span>
                  <span className="text-[10px] text-[#74788E]">
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
                  ? 'bg-[#F3F1FF] border-[#6755E8] shadow-xs'
                  : 'bg-[#F8F9FF] border-[#E9EAF3] hover:border-[#D4D7E8]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBF8FB] text-[#167E96] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#252641]">Interactive Hands-On Activities</h3>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      preferredPresentation.includes('interactive')
                        ? 'bg-[#6755E8] border-[#6755E8] text-white'
                        : 'border-[#D4D7E8]'
                    }`}
                  >
                    {preferredPresentation.includes('interactive') && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-[#74788E] mt-0.5">
                  Two-pan balance scale widgets, rainbow arrow builders, and interactive math keyboards.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-bold text-[#74788E] hover:text-[#252641] transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white text-xs font-bold shadow-md shadow-[#6755E8]/30 transition cursor-pointer"
            >
              <span>Review & Complete</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Profile Completion & Celebration */}
      {step === 4 && (
        <div className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#E8F8F4] text-[#1B886B] border border-[#CEEFE6] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-display font-black text-[#252641]">Profile Configuration Complete</h1>
            <p className="text-xs text-[#74788E] mt-1">
              Your offline workspace is configured for your syllabus track and presentation preferences.
            </p>
          </div>

          {/* Profile Summary Card */}
          <div className="p-5 rounded-2xl bg-[#F8F9FF] border border-[#E9EAF3] text-left space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E9EAF3]">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E9EAF3] overflow-hidden shadow-xs shrink-0">
                <img 
                  src={customAvatarUrl || (PRESET_AVATARS.find(a => a.id === selectedAvatar)?.path || selectedAvatar)} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center font-bold text-white bg-[#6755E8] text-xs">
                  {name.substring(0, 2).toUpperCase() || 'MT'}
                </div>
              </div>
              <div>
                <span className="text-sm font-bold text-[#252641] block">{name}</span>
                <span className="text-xs font-mono font-bold text-[#5140CA]">@{username}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#74788E] block text-[11px] font-medium">Class & Target:</span>
                <span className="text-[#252641] font-bold">{grade} · {targetExam}</span>
              </div>
              <div>
                <span className="text-[#74788E] block text-[11px] font-medium">Presentation Styles:</span>
                <span className="text-[#252641] font-bold capitalize">
                  {[...preferredPresentation, ...(audioSupport && !preferredPresentation.includes('audio') ? ['audio'] : [])].join(', ')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-sm shadow-xl shadow-[#6755E8]/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFC85A] fill-[#FFC85A]" />
            <span>Enter Mathematics Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

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
  ArrowLeft,
} from 'lucide-react';
import { StudentProfile, LearningPreference, GradeLevel, ExamTrack } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';
import { AVATAR_PRESETS, resolveAvatarSrc, getInitials } from '../../utils/avatar';

interface StudentProfileSetupProps {
  initialProfile: StudentProfile;
  onSetupCompleted: (updatedProfile: StudentProfile) => void;
}

const STEPS = [
  { id: 1, label: 'Avatar' },
  { id: 2, label: 'Username & class' },
  { id: 3, label: 'Preferences' },
  { id: 4, label: 'Review' },
] as const;

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

  const avatarPreviewSrc = customAvatarUrl || resolveAvatarSrc(selectedAvatar);
  const initials = getInitials(name);

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
      avatarSeed: customAvatarUrl || selectedAvatar,
    };

    await storageService.saveStudentProfile(updated);
    onSetupCompleted(updated);
  };

  return (
    <div className="max-w-xl mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 py-8 animate-fade-in space-y-5">
      {/* Progress header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="eyebrow">Profile setup</span>
          <span className="font-semibold text-[#475569]">Step {step} of 4</span>
        </div>
        <div
          className="progress-track h-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step}
          aria-label="Profile setup progress"
        >
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <ol className="flex items-center justify-between gap-1">
          {STEPS.map((s) => (
            <li
              key={s.id}
              aria-current={step === s.id ? 'step' : undefined}
              className={`text-[10px] font-semibold truncate ${
                step === s.id ? 'text-[#2563EB]' : step > s.id ? 'text-[#047857]' : 'text-[#94A3B8]'
              }`}
            >
              {s.id}. {s.label}
            </li>
          ))}
        </ol>
      </div>

      {/* Step 1: Avatar Selection & Upload */}
      {step === 1 && (
        <section className="card-modern p-6 sm:p-7 space-y-5 animate-fade-in" aria-labelledby="setup-avatar-heading">
          <div>
            <h1 id="setup-avatar-heading" className="page-title">
              Pick your avatar
            </h1>
            <p className="body-text mt-1">
              Choose illustrated artwork or upload your own photo (max 1 MB).
            </p>
          </div>

          {/* Current Avatar Preview */}
          <div className="flex items-center justify-center py-1">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#2563EB] bg-[#EFF6FF] shadow-md flex items-center justify-center">
                {avatarPreviewSrc ? (
                  <img
                    src={avatarPreviewSrc}
                    alt="Selected avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="font-display text-2xl font-bold text-[#1D4ED8]">{initials}</span>
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge badge-primary shadow-sm">
                Preview
              </span>
            </div>
          </div>

          {/* Preset Grid */}
          <fieldset>
            <legend className="label-modern">Illustrated presets</legend>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {AVATAR_PRESETS.map((av) => {
                const active = selectedAvatar === av.id && !customAvatarUrl;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av.id);
                      setCustomAvatarUrl(null);
                      setFileError(null);
                    }}
                    aria-pressed={active}
                    aria-label={`Use ${av.label} avatar`}
                    className={`group relative p-1 rounded-xl border transition-colors cursor-pointer ${
                      active
                        ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/25'
                        : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE]'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#F1F5F9]">
                      <img
                        src={av.path}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {active && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center shadow-sm border border-white">
                        <Check className="w-3 h-3 text-white" strokeWidth={4} aria-hidden="true" />
                      </span>
                    )}
                    <span className="text-[9px] font-semibold text-[#475569] mt-1 block truncate px-0.5 text-center">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Custom Upload */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
            <label htmlFor="avatar-upload" className="label-modern">
              Or upload a photo
            </label>
            <label
              htmlFor="avatar-upload"
              className="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[13px] text-[#0F172A] font-semibold cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span>Choose image (PNG, JPG, max 1 MB)</span>
              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
            {fileError && (
              <p role="alert" className="text-[12px] font-semibold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-3 py-2">
                {fileError}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button onClick={() => setStep(2)} className="btn-primary">
              <span>Next: username & class</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Username & Educational Level */}
      {step === 2 && (
        <section className="card-modern p-6 sm:p-7 space-y-5 animate-fade-in" aria-labelledby="setup-identity-heading">
          <div>
            <h1 id="setup-identity-heading" className="page-title">
              Your name and class
            </h1>
            <p className="body-text mt-1">
              Your username is the pseudonym shown on class leaderboards.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="display-name" className="label-modern">
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="input-modern"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <label htmlFor="setup-username" className="label-modern mb-0">
                  Username
                </label>
                {isUsernameValid ? (
                  <span className="text-[11px] text-[#047857] font-semibold inline-flex items-center gap-1">
                    <Check className="w-3 h-3" aria-hidden="true" /> Looks good
                  </span>
                ) : (
                  <span className="text-[11px] text-[#92400E] font-medium">
                    Min 3 characters (letters, numbers, _)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-3 rounded-xl bg-white border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] transition-shadow">
                <span className="text-[14px] text-[#94A3B8] font-mono" aria-hidden="true">
                  @
                </span>
                <input
                  id="setup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  autoComplete="username"
                  className="w-full min-h-[44px] bg-transparent text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="setup-grade" className="label-modern">
                  Senior class
                </label>
                <select
                  id="setup-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="input-modern font-semibold cursor-pointer"
                >
                  <option value="SS1">SS1 (Senior Sec 1)</option>
                  <option value="SS2">SS2 (Senior Sec 2)</option>
                  <option value="SS3">SS3 (Senior Sec 3)</option>
                </select>
              </div>

              <div>
                <label htmlFor="setup-exam" className="label-modern">
                  Target exam
                </label>
                <select
                  id="setup-exam"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value as ExamTrack)}
                  className="input-modern font-semibold cursor-pointer"
                >
                  <option value="WAEC">WAEC General Math</option>
                  <option value="JAMB">JAMB UTME</option>
                  <option value="NECO">NECO Senior Math</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button onClick={() => setStep(1)} className="btn-ghost">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!isUsernameValid || name.trim().length < 2}
              className="btn-primary"
            >
              <span>Next: preferences</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Learning Presentation Preferences */}
      {step === 3 && (
        <section className="card-modern p-6 sm:p-7 space-y-5 animate-fade-in" aria-labelledby="setup-prefs-heading">
          <div>
            <h1 id="setup-prefs-heading" className="page-title">
              How you like to learn
            </h1>
            <p className="body-text mt-1">
              Pick one or more presentation styles. You can change these any time in your profile.
            </p>
          </div>

          <div className="space-y-3">
            {/* Visual */}
            <button
              type="button"
              onClick={() => togglePresentation('visual')}
              aria-pressed={preferredPresentation.includes('visual')}
              className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3.5 ${
                preferredPresentation.includes('visual')
                  ? 'bg-[#EFF6FF] border-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[13px] font-semibold text-[#0F172A]">Visual explanations</h2>
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      preferredPresentation.includes('visual')
                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                        : 'border-[#CBD5E1]'
                    }`}
                    aria-hidden="true"
                  >
                    {preferredPresentation.includes('visual') && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
                <p className="text-[12px] text-[#475569] mt-0.5">
                  Diagrams, step comparison tables, and highlighted balance transformations.
                </p>
              </div>
            </button>

            {/* Audio Support (Dedicated Boolean Flag & Presentation Mode) */}
            <div
              className={`p-4 rounded-xl border transition-colors space-y-3 ${
                audioSupport ? 'bg-[#ECFDF5] border-[#059669]' : 'bg-white border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] text-[#047857] flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[13px] font-semibold text-[#0F172A]">Audio read-aloud</h2>
                      <span className="badge badge-mastery">Zero data</span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={audioSupport}
                      onClick={() => togglePresentation('audio')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          audioSupport ? 'text-[#047857]' : 'text-[#64748B]'
                        }`}
                      >
                        {audioSupport ? 'Enabled' : 'Disabled'}
                      </span>
                      <span
                        className={`w-9 h-5 rounded-full transition-colors relative p-0.5 block ${
                          audioSupport ? 'bg-[#059669]' : 'bg-[#CBD5E1]'
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            audioSupport ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                  <p className="text-[12px] text-[#475569] mt-1 leading-relaxed">
                    Spoken instructions, equation steps, and diagnostic feedback using your device's
                    built-in speech engine.
                  </p>
                </div>
              </div>

              {/* Interactive Audio Voice Preview Tester */}
              <div className="pt-3 border-t border-[#A7F3D0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-[12px] text-[#0F172A] font-semibold">Test your device voice</span>
                  <span className="text-[11px] text-[#64748B]">
                    Works offline with a local OS voice
                  </span>
                </div>
                <AudioPlayerControl
                  textToSpeak="Welcome to MindTrace. Audio read-aloud assistance is ready. I will read mathematics equations and step feedback aloud on your device."
                  label="Sample voice preview"
                  variant="card"
                  hasAudioPreference={audioSupport}
                />
              </div>
            </div>

            {/* Interactive */}
            <button
              type="button"
              onClick={() => togglePresentation('interactive')}
              aria-pressed={preferredPresentation.includes('interactive')}
              className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3.5 ${
                preferredPresentation.includes('interactive')
                  ? 'bg-[#EFF6FF] border-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[13px] font-semibold text-[#0F172A]">Hands-on activities</h2>
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      preferredPresentation.includes('interactive')
                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                        : 'border-[#CBD5E1]'
                    }`}
                    aria-hidden="true"
                  >
                    {preferredPresentation.includes('interactive') && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
                <p className="text-[12px] text-[#475569] mt-0.5">
                  Two-pan balance widgets, rainbow arrow builders, and interactive math keyboards.
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button onClick={() => setStep(2)} className="btn-ghost">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </button>
            <button onClick={() => setStep(4)} className="btn-primary">
              <span>Review</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Profile Completion & Celebration */}
      {step === 4 && (
        <section className="card-modern p-6 sm:p-7 space-y-5 animate-fade-in" aria-labelledby="setup-review-heading">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h1 id="setup-review-heading" className="page-title">
                You're all set
              </h1>
              <p className="body-text mt-1">
                Your offline workspace is configured for your syllabus track and presentation style.
              </p>
            </div>
          </div>

          {/* Profile Summary Card */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-left space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] overflow-hidden shrink-0 flex items-center justify-center">
                {avatarPreviewSrc ? (
                  <img
                    src={avatarPreviewSrc}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="font-display text-sm font-bold text-[#475569]">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[14px] font-semibold text-[#0F172A] block truncate">{name}</span>
                <span className="text-[12px] font-mono font-semibold text-[#1D4ED8] truncate block">
                  @{username}
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
              <div>
                <dt className="text-[#64748B] font-medium">Class & target</dt>
                <dd className="text-[#0F172A] font-semibold mt-0.5">
                  {grade} · {targetExam}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B] font-medium">Presentation styles</dt>
                <dd className="text-[#0F172A] font-semibold mt-0.5 capitalize">
                  {[
                    ...preferredPresentation,
                    ...(audioSupport && !preferredPresentation.includes('audio') ? ['audio'] : []),
                  ].join(', ')}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setStep(3)} className="btn-ghost">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </button>
            <button onClick={handleFinish} className="btn-primary">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Enter math workspace</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

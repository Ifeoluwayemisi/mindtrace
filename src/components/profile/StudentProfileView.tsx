import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Volume2,
  Eye,
  Sliders,
  LogOut,
  Download,
  Upload,
} from 'lucide-react';
import { StudentProfile, LearningPreference, GradeLevel, ExamTrack } from '../../types';
import { storageService } from '../../services/storageService';
import { AudioPlayerControl } from '../common/AudioPlayerControl';
import { AVATAR_PRESETS, resolveAvatarSrc, getInitials } from '../../utils/avatar';

interface StudentProfileViewProps {
  student: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onLogout: () => void;
}

type ProfileSection = 'profile' | 'preferences' | 'privacy' | 'storage';

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onProfileUpdated,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');

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

  const avatarSrc = resolveAvatarSrc(avatarSeed);
  const initials = getInitials(name);

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

  const sections: Array<{ key: ProfileSection; label: string }> = [
    { key: 'profile', label: 'Personal info' },
    { key: 'preferences', label: 'Presentation' },
    { key: 'privacy', label: 'Privacy' },
    { key: 'storage', label: 'Offline data' },
  ];

  const preferenceCards: Array<{
    key: LearningPreference;
    title: string;
    description: string;
    icon: typeof Eye;
    tone: string;
  }> = [
    {
      key: 'visual',
      title: 'Visual diagrams & comparison tables',
      description: 'Step transitions highlighted with side-by-side formulas.',
      icon: Eye,
      tone: 'bg-[#DBEAFE] text-[#1D4ED8]',
    },
    {
      key: 'interactive',
      title: 'Hands-on manipulatives',
      description: 'Manipulate balance scale pans and rainbow brackets with sliders.',
      icon: Sliders,
      tone: 'bg-[#E0F2FE] text-[#0369A1]',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {saveToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-3 rounded-xl bg-white border border-[#A7F3D0] shadow-lg text-[13px] font-semibold text-[#065F46] flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669]" aria-hidden="true" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Profile header */}
      <section className="card-modern p-5 sm:p-7" aria-labelledby="profile-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] overflow-hidden flex items-center justify-center shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-display text-xl font-bold text-[#1D4ED8]">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 id="profile-heading" className="page-title truncate">
                {student.name}
              </h1>
              <p className="text-[13px] text-[#1D4ED8] font-mono font-semibold truncate">
                @{student.username}
              </p>
              <p className="text-[13px] text-[#475569] mt-0.5 truncate">
                {student.classSection} · {student.school} · {student.targetExam} track
              </p>
            </div>
          </div>

          <button onClick={onLogout} className="btn-secondary self-start sm:self-center shrink-0">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </section>

      {/* Section navigation */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl w-fit"
        >
          {sections.map((section) => {
            const active = activeSection === section.key;
            return (
              <button
                key={section.key}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSection(section.key)}
                className={`px-3.5 min-h-[38px] text-[12px] font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#475569] hover:text-[#0F172A] border border-transparent'
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: Personal Info & Avatar */}
      {activeSection === 'profile' && (
        <section className="card-modern p-5 sm:p-7 space-y-5 animate-fade-in" aria-labelledby="personal-heading">
          <div>
            <h2 id="personal-heading" className="section-title">
              Student details
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              Update your school information and avatar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="label-modern">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="input-modern"
              />
            </div>

            <div>
              <label htmlFor="profile-username" className="label-modern">
                Username
              </label>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                autoComplete="username"
                className="input-modern font-mono font-semibold"
              />
            </div>

            <div>
              <label htmlFor="profile-grade" className="label-modern">
                Class level
              </label>
              <select
                id="profile-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="input-modern font-semibold cursor-pointer"
              >
                <option value="SS1">SS1</option>
                <option value="SS2">SS2</option>
                <option value="SS3">SS3</option>
              </select>
            </div>

            <div>
              <label htmlFor="profile-exam" className="label-modern">
                Target exam
              </label>
              <select
                id="profile-exam"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as ExamTrack)}
                className="input-modern font-semibold cursor-pointer"
              >
                <option value="WAEC">WAEC General Mathematics</option>
                <option value="JAMB">JAMB UTME</option>
                <option value="NECO">NECO Senior Mathematics</option>
              </select>
            </div>
          </div>

          {/* Change Avatar */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
            <fieldset>
              <legend className="label-modern">Choose an avatar</legend>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {AVATAR_PRESETS.map((av) => {
                  const active = avatarSrc === av.path;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarSeed(av.id)}
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

            <div>
              <label
                htmlFor="profile-avatar-upload"
                className="inline-flex items-center gap-2 min-h-[40px] px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A] cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                <span>Upload a new photo</span>
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <button onClick={handleSaveProfile} className="btn-primary">
              Save changes
            </button>
          </div>
        </section>
      )}

      {/* Section 2: Presentation Preferences */}
      {activeSection === 'preferences' && (
        <section className="card-modern p-5 sm:p-7 space-y-4 animate-fade-in" aria-labelledby="prefs-heading">
          <div>
            <h2 id="prefs-heading" className="section-title">
              Presentation preferences
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              Choose how explanations and step-by-step remedies are delivered.
            </p>
          </div>

          <div className="space-y-3">
            {preferenceCards.map(({ key, title, description, icon: Icon, tone }) => {
              const active = preferredPresentation.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePresentation(key)}
                  aria-pressed={active}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-[#0F172A]">{title}</h3>
                      <p className="text-[12px] text-[#475569]">{description}</p>
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      active ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#CBD5E1]'
                    }`}
                    aria-hidden="true"
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}

            {/* Audio read-aloud */}
            <div
              className={`p-4 rounded-xl border transition-colors space-y-3 ${
                audioSupport ? 'bg-[#ECFDF5] border-[#059669]' : 'bg-white border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] text-[#047857] flex items-center justify-center shrink-0">
                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-[#0F172A]">Audio read-aloud</h3>
                      <span className="badge badge-mastery">Zero data</span>
                    </div>
                    <p className="text-[12px] text-[#475569] mt-0.5">
                      Spoken problems, step directions, and explanations using browser speech.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={audioSupport}
                  onClick={() => togglePresentation('audio')}
                  className="flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      audioSupport ? 'text-[#047857]' : 'text-[#64748B]'
                    }`}
                  >
                    {audioSupport ? 'On' : 'Off'}
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

              <div className="pt-3 border-t border-[#A7F3D0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-[12px] text-[#0F172A] font-semibold">Voice preview</span>
                  <span className="text-[11px] text-[#64748B]">Native Web Speech API</span>
                </div>
                <AudioPlayerControl
                  textToSpeak="MindTrace audio read-aloud assistance is enabled. You can pause, resume, and replay explanations at any time during practice."
                  label="Test audio playback"
                  variant="card"
                  hasAudioPreference={audioSupport}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <button onClick={handleSaveProfile} className="btn-primary">
              Save preferences
            </button>
          </div>
        </section>
      )}

      {/* Section 3: Privacy & Leaderboard */}
      {activeSection === 'privacy' && (
        <section className="card-modern p-5 sm:p-7 space-y-4 animate-fade-in" aria-labelledby="privacy-heading">
          <div>
            <h2 id="privacy-heading" className="section-title">
              Privacy & leaderboard
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              Control how your learning activity appears to classmates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-[#0F172A]">Show on class leaderboard</h3>
              <p className="text-[12px] text-[#475569] mt-0.5">
                When off, your score is hidden or shown as “Anonymous Student”.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={leaderboardOptIn}
              aria-label="Show on class leaderboard"
              onClick={() => setLeaderboardOptIn(!leaderboardOptIn)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                leaderboardOptIn ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  leaderboardOptIn ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <button onClick={handleSaveProfile} className="btn-primary">
              Save privacy settings
            </button>
          </div>
        </section>
      )}

      {/* Section 4: Offline Storage & Sync */}
      {activeSection === 'storage' && (
        <section className="card-modern p-5 sm:p-7 space-y-4 animate-fade-in" aria-labelledby="storage-heading">
          <div>
            <h2 id="storage-heading" className="section-title">
              Offline data
            </h2>
            <p className="text-[13px] text-[#475569] mt-1">
              Inspect on-device diagnostic records and the micro-sync queue.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <dt className="text-[#64748B]">Database name</dt>
              <dd className="font-mono font-semibold text-[#1D4ED8]">MindTraceOfflineDB (v2)</dd>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <dt className="text-[#64748B]">IndexedDB object stores</dt>
              <dd className="font-mono text-[#0F172A] font-semibold break-words">
                profiles, diagnoses, syncQueue, teacherAnalytics, lessonPackages
              </dd>
            </div>
          </dl>

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
              className="btn-secondary"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Export profile backup</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

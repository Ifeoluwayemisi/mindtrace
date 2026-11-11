import avatarMale1 from '../assets/images/student_avatar_male_1_1794394444739.jpg';
import avatarFemale1 from '../assets/images/student_avatar_female_1_1794394445859.jpg';
import avatarMale2 from '../assets/images/student_avatar_male_2_1794394446145.jpg';
import avatarFemale2 from '../assets/images/student_avatar_female_2_1794394447322.jpg';
import avatarMale3 from '../assets/images/student_avatar_male_3_1794394447398.jpg';
import avatarFemale3 from '../assets/images/student_avatar_female_3_1794394447853.jpg';
import avatarMale4 from '../assets/images/student_avatar_male_4_1794394448086.jpg';
import avatarFemale4 from '../assets/images/student_avatar_female_4_1794394449400.jpg';

export interface AvatarPreset {
  id: string;
  label: string;
  path: string;
}

/**
 * Illustrated avatar presets. These are real artwork assets, bundled through Vite
 * so they resolve correctly in both the dev server and production builds.
 */
export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'AVATAR_M1', label: 'Tunde', path: avatarMale1 },
  { id: 'AVATAR_F1', label: 'Aminat', path: avatarFemale1 },
  { id: 'AVATAR_M2', label: 'Chidi', path: avatarMale2 },
  { id: 'AVATAR_F2', label: 'Ngozi', path: avatarFemale2 },
  { id: 'AVATAR_M3', label: 'Segun', path: avatarMale3 },
  { id: 'AVATAR_F3', label: 'Folashade', path: avatarFemale3 },
  { id: 'AVATAR_M4', label: 'Babatunde', path: avatarMale4 },
  { id: 'AVATAR_F4', label: 'Zainab', path: avatarFemale4 },
];

const LEGACY_FILENAMES: Record<string, string> = {
  'student_avatar_male_1_1794394444739.jpg': avatarMale1,
  'student_avatar_female_1_1794394445859.jpg': avatarFemale1,
  'student_avatar_male_2_1794394446145.jpg': avatarMale2,
  'student_avatar_female_2_1794394447322.jpg': avatarFemale2,
  'student_avatar_male_3_1794394447398.jpg': avatarMale3,
  'student_avatar_female_3_1794394447853.jpg': avatarFemale3,
  'student_avatar_male_4_1794394448086.jpg': avatarMale4,
  'student_avatar_female_4_1794394449400.jpg': avatarFemale4,
};

/**
 * Resolves any stored avatar seed to a displayable image URL.
 * Returns null when the value is just initials, so callers can render a fallback.
 */
export function resolveAvatarSrc(seed?: string | null): string | null {
  if (!seed) return null;
  const trimmed = seed.trim();
  if (!trimmed) return null;

  const preset = AVATAR_PRESETS.find((a) => a.id === trimmed);
  if (preset) return preset.path;

  // Legacy absolute paths stored before assets were bundled.
  const fileName = trimmed.split('/').pop()?.split('?')[0] || '';
  if (LEGACY_FILENAMES[fileName]) return LEGACY_FILENAMES[fileName];

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // 1–3 characters is treated as an initials fallback, not an image.
  if (trimmed.length <= 3) return null;

  return trimmed;
}

export function getInitials(name?: string | null): string {
  if (!name) return 'MT';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

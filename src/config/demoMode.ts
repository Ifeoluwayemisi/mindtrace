/**
 * Server-controlled teacher demo mode.
 * This module is deliberately server-only and throws during production startup
 * rather than allowing a demo configuration to be exposed accidentally.
 */
const demoMode = process.env.MINDTRACE_DEMO_MODE === 'true';

if (demoMode && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: MINDTRACE_DEMO_MODE=true is not permitted in production.');
}

export function isDemoModeEnabled(): boolean {
  return demoMode;
}

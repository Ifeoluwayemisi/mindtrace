/**
 * Server-controlled teacher demo mode.
 * This module is deliberately server-only and refuses to enable demo mode in production.
 */
const demoMode = process.env.MINDTRACE_DEMO_MODE === 'true';

if (demoMode && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: MINDTRACE_DEMO_MODE=true is not permitted in production.');
}

/** Used by authentication and authorization checks. */
export function isDemoModeEnabled(): boolean {
  return demoMode;
}

/** Backward-compatible name used by the server and teacher routes. */
export function isDemoMode(): boolean {
  return isDemoModeEnabled();
}

/** Public, non-secret configuration exposed to the client. */
export function getDemoModeStatus(): {
  demoMode: boolean;
  environment: string;
  safeguardActive: boolean;
} {
  const environment = process.env.NODE_ENV || 'development';
  return {
    demoMode: isDemoModeEnabled(),
    environment,
    safeguardActive: environment === 'production' && !demoMode,
  };
}

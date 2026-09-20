// ===== FAMILY TIME GUARD SETTINGS =====
// Production limit: 2 hours of ACTIVE YouTube playback per local calendar day.
// For quick testing, temporarily change this to:
// const LIMIT_SECONDS = 60;
const LIMIT_SECONDS = 2 * 60 * 60;

const STORAGE_KEY = "familyTimeGuardState";
const STORAGE_VERSION = 1;

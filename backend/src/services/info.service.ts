import { readFile } from 'node:fs/promises';

/**
 * The shape of `data/app-info.json`.
 */
export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

// Resolved relative to this module so it works from both `src/` (dev) and
// `dist/` (build): each is one level under `backend/`, so `../../data` points
// at `backend/data/` in both.
const APP_INFO_PATH = new URL('../../data/app-info.json', import.meta.url);

/**
 * Reads and returns the static app info from `data/app-info.json`.
 */
export async function getAppInfo(): Promise<AppInfo> {
  const raw = await readFile(APP_INFO_PATH, 'utf8');
  return JSON.parse(raw) as AppInfo;
}

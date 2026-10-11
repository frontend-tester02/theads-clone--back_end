import type { Request, Response } from 'express';
import { getAppInfo } from '../services/info.service.js';

/**
 * GET /api/info
 * Returns the static app info read from `data/app-info.json`.
 */
export async function info(_req: Request, res: Response): Promise<void> {
  const data = await getAppInfo();

  res.status(200).json({ data });
}

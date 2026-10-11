import { Router } from 'express';
import { info } from '../controllers/info.controller.js';

export const infoRouter = Router();

infoRouter.get('/', info);

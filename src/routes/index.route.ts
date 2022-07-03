import express from 'express';
import pageRouter from '../routes/pages/index.route';
import authRouter from '../routes/auth/index.route';
import apiRouter from '../routes/api/index.route';
import { API_PATH, AUTH_PATH } from '../utils/constant.util';

const router = express.Router();

router.use('/', pageRouter);
router.use(AUTH_PATH, authRouter);
router.use(API_PATH, apiRouter);
router.use((_req, res) => res.sendStatus(404));

export default router;

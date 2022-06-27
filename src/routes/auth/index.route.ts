import express from 'express';
import {
  auth_login,
  auth_callback
} from '../../controllers/auth/index.controller';
import { CALLBACK_PATH, LOGIN_PATH } from '../../utils/constant.util';

const authRouter = express.Router();

authRouter.route(LOGIN_PATH).get(auth_login);
authRouter.route(CALLBACK_PATH).get(auth_callback);

export default authRouter;

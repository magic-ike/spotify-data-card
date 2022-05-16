import express from 'express';
import { auth_login, auth_callback } from '../../controllers/auth.controller';

const authRouter = express.Router();

authRouter.route('/login').get(auth_login);
authRouter.route('/callback').get(auth_callback);

export default authRouter;

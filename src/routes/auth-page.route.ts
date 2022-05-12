import express from 'express';
import {
  auth_login,
  auth_callback,
  auth_refresh_token
} from '../controllers/auth-page.controller';

const authPageRouter = express.Router();

authPageRouter.route('/login').get(auth_login);
authPageRouter.route('/callback').get(auth_callback);
authPageRouter.route('/refresh_token').get(auth_refresh_token);

export default authPageRouter;

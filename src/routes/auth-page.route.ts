import express from 'express';
import {
  auth_page_login,
  auth_page_callback
} from '../controllers/auth-page.controller';

const authPageRouter = express.Router();

authPageRouter.route('/login').get(auth_page_login);
authPageRouter.route('/callback').get(auth_page_callback);

export default authPageRouter;

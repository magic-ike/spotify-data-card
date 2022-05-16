import express from 'express';
import { index } from '../controllers/home-page.controller';

const homePageRouter = express.Router();

homePageRouter.route('/').get(index);

export default homePageRouter;

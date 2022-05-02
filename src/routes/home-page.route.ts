import express from 'express';
import { home_page_index } from '../controllers/home-page.controller';

const homePageRouter = express.Router();

homePageRouter.route('/').get(home_page_index);

export default homePageRouter;

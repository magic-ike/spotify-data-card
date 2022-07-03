import express from 'express';
import { index } from '../../controllers/pages/home.controller';

const homePageRouter = express.Router();

homePageRouter.route('/').get(index);

export default homePageRouter;

import express from 'express';
import homePageRouter from './home.route';
import cardPageRouter from './card.route';
import { CARD_PATH } from '../../utils/constant.util';

const pageRouter = express.Router();

// every page should have its own router and controller
pageRouter.use('/', homePageRouter);
pageRouter.use(CARD_PATH, cardPageRouter);

export default pageRouter;

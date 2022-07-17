import express from 'express';
import cardApiRouter from './card.route';
import { CARD_PATH } from '../../utils/constant.util';

const apiRouter = express.Router();

// every route should have its own router and controller
apiRouter.use(CARD_PATH, cardApiRouter);

export default apiRouter;

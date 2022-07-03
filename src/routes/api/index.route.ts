import express from 'express';
import cardApiRouter from './card.route';
import { CARD_PATH } from '../../utils/constant.util';
import { setHttpCacheControlHeader } from '../../middleware/http-cache.middleware';

const apiRouter = express.Router();

apiRouter.use(setHttpCacheControlHeader);
// every route should have its own router and controller
apiRouter.use(CARD_PATH, cardApiRouter);

export default apiRouter;

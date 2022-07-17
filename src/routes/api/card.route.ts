import express from 'express';
import { card_get, card_delete } from '../../controllers/api/card.controller';
import { setHttpCacheControlHeader } from '../../middleware/http-cache.middleware';

const cardApiRouter = express.Router();

cardApiRouter.use(setHttpCacheControlHeader);
cardApiRouter.route('/').get(card_get).delete(card_delete);

export default cardApiRouter;

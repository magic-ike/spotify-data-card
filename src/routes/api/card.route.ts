import express from 'express';
import { card_get, card_delete } from '../../controllers/api/card.controller';

const cardRouter = express.Router();

cardRouter.route('/').get(card_get).delete(card_delete);

export default cardRouter;

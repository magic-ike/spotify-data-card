import express from 'express';
import { card_index } from '../../controllers/card.controller';

const cardRouter = express.Router();

cardRouter.route('/').get(card_index);

export default cardRouter;

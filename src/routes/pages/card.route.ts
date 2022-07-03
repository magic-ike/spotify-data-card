import express from 'express';
import { card_index } from '../../controllers/pages/card.controller';

const cardPageRouter = express.Router();

cardPageRouter.route('/').get(card_index);

export default cardPageRouter;

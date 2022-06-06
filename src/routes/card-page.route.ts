import express from 'express';
import { card_index } from '../controllers/card-page.controller';

const cardPageRouter = express.Router();

cardPageRouter.route('/').get(card_index);

export default cardPageRouter;

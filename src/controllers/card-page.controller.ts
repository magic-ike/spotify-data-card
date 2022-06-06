import { RequestHandler } from 'express';

export const card_index: RequestHandler = (_req, res) => {
  res.render('card/index.view.hbs');
};

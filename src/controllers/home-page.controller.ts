import { RequestHandler } from 'express';

export const index: RequestHandler = (_req, res) => {
  res.render('home');
};

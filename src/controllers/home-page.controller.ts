import { RequestHandler } from 'express';

export const home_page_index: RequestHandler = (_req, res) => {
  res.render('home', {
    title: 'Hello, World!'
  });
};

import express from 'express';
import homePageRouter from './home-page.route';
import cardPageRouter from './card-page.route';

const pageRouter = express.Router();

// every page should have its own router and controller
pageRouter.use('/', homePageRouter);
pageRouter.use('/card', cardPageRouter);

export default pageRouter;

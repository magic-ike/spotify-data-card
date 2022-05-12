import express from 'express';
import homePageRouter from './home-page.route';
import authPageRouter from './auth-page.route';

const pageRouter = express.Router();

// every page should have its own router
pageRouter.use('/', homePageRouter);
pageRouter.use('/auth', authPageRouter);

export default pageRouter;

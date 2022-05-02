import express from 'express';
import homePageRouter from './home-page.route';

const pageRouter = express.Router();

// every page should have its own router
pageRouter.use('/', homePageRouter);

export default pageRouter;

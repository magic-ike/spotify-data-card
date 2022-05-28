import express from 'express';
import cardRouter from './card.route';

const apiRouter = express.Router();

// every route should have its own router and controller
apiRouter.use('/card', cardRouter);

export default apiRouter;

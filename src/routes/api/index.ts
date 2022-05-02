import express from 'express';

const apiRouter = express.Router();

apiRouter.route('/').get((_req, res) => res.sendStatus(404));
// new api routes go here
// every route should have its own router

export default apiRouter;

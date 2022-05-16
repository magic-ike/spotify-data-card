import { RequestHandler } from 'express';
import CardRequest from '../interfaces/card-request.interface';

export const card_index: RequestHandler = (req, res) => {
  const { user_id } = req.query as unknown as CardRequest;
  if (!user_id) {
    // TODO: render svg
    res.send('Missing required parameter: user_id');
    return;
  }

  // TODO: render svg
  res.send(`user_id: ${user_id}`);
};

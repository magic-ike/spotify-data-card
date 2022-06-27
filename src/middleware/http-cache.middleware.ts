import { RequestHandler, Response } from 'express';
import { API_PATH, AUTH_PATH, CARD_PATH } from '../utils/constant.util';

const ONE_DAY = 60 * 60 * 24;
const THREE_HOURS = 60 * 60 * 3;
const ONE_HOUR = 60 * 60;
const HALF_HOUR = 60 * 30;

export const setHttpCacheControlHeader: RequestHandler = (req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith(AUTH_PATH)) {
    disableHttpCaching(res);
    next();
    return;
  }

  let maxAge = ONE_DAY;
  let staleWhileReval = THREE_HOURS;
  if (req.path.startsWith(API_PATH + CARD_PATH)) {
    maxAge = ONE_HOUR;
    staleWhileReval = HALF_HOUR;
  }

  res.set(
    'Cache-control',
    `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileReval}`
  );
  next();
};

export const disableHttpCaching = (res: Response) => {
  res.set('Cache-control', 'no-store, no-cache');
};

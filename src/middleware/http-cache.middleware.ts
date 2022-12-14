import { RequestHandler, Response } from 'express';

const ONE_HOUR = 60 * 60;
const HALF_HOUR = ONE_HOUR / 2;

const setHttpCacheControlHeader: RequestHandler = (_req, res, next) => {
  res.set(
    'Cache-control',
    `public, max-age=${ONE_HOUR}, stale-while-revalidate=${HALF_HOUR}`
  );
  next();
};

export default setHttpCacheControlHeader;

export const disableHttpCaching = (res: Response) => {
  res.set(
    'Cache-control',
    'no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate'
  );
};

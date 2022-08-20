import { RequestHandler } from 'express';
import { PROD_NODE_ENV } from '../utils/constant.util';

const forceSSLRedirect: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === PROD_NODE_ENV && !req.secure)
    return res.redirect('https://' + req.headers.host + req.url);
  next();
};

export default forceSSLRedirect;

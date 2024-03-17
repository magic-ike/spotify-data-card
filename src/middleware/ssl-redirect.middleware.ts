import { RequestHandler } from 'express';
import { isProdMode } from '../utils/env.util';

const forceSSLRedirect: RequestHandler = (req, res, next) => {
  if (isProdMode() && !req.secure)
    return res.redirect('https://' + req.headers.host + req.url);
  next();
};

export default forceSSLRedirect;

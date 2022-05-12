import { Request } from 'express';

export const getUrl = (req: Request) => {
  return `${req.protocol}://${req.get('host')}`; // protocol + host
};

export const getBaseUrl = (req: Request) => {
  return `${getUrl(req)}${req.baseUrl}`; // protocol + host + path on which router instance was mounted (e.g., GET /a/b/c => '/a/b')
};

export const getFullUrl = (req: Request) => {
  return `${getBaseUrl(req)}${req.path}`; // protocol + host + full path
};

export const getFullUrlWithQueryString = (req: Request) => {
  return `${getUrl(req)}${req.originalUrl}`; // protocol + host + full path + query string
};

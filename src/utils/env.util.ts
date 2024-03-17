import { PROD_NODE_ENV } from './constant.util';

export const isProdMode = () => process.env.NODE_ENV === PROD_NODE_ENV;

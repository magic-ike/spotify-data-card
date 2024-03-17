import {
  SITE_TITLE,
  HOME_PAGE_VIEW_PATH,
  CARD_PAGE_VIEW_PATH
} from '../utils/constant.util';

// server
export const PORT = process.env.PORT || 8080;
export const HBS_HELPERS = {
  siteTitle: () => SITE_TITLE,
  homePageView: () => HOME_PAGE_VIEW_PATH,
  cardPageView: () => CARD_PAGE_VIEW_PATH,
  areEqual: (a: string, b: string) => a === b
};

// spotify
export const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
export const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

// db
export const MONGODB_URI = process.env.MONGODB_URI!;
export const REDIS_URI = process.env.REDIS_URI!;

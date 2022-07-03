import { RequestHandler } from 'express';
import { HbsViewProps } from '../../interfaces/hbs-view-props.interface';
import {
  SITE_TITLE,
  HOME_PAGE_VIEW_PATH,
  SPOTIFY_ICON_PATH
} from '../../utils/constant.util';
import { getFullUrl, getUrl } from '../../utils/url.util';

export const index: RequestHandler = (req, res) => {
  const siteUrl = getUrl(req);
  const pageUrl = getFullUrl(req);
  const props: HbsViewProps = {
    pageTitle: SITE_TITLE,
    pageDescription: 'Share your music taste with the world.',
    pageUrl,
    siteImage: siteUrl + SPOTIFY_ICON_PATH
  };
  res.render(HOME_PAGE_VIEW_PATH + '.hbs', { ...props });
};

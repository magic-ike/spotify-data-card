import { RequestHandler } from 'express';
import { HbsViewProps } from '../../interfaces/hbs-view-props.interface';
import {
  SITE_TITLE,
  SPOTIFY_ICON_PATH,
  CARD_PAGE_VIEW_PATH,
  CARD_PAGE_SUBTITLE
} from '../../utils/constant.util';
import { getFullUrl, getUrl } from '../../utils/url.util';

export const card_index: RequestHandler = (req, res) => {
  const siteUrl = getUrl(req);
  const pageUrl = getFullUrl(req);
  const props: HbsViewProps = {
    pageTitle: `Card View - ${SITE_TITLE}`,
    pageDescription: "View someone's Spotify data.",
    pageUrl,
    siteImage: siteUrl + SPOTIFY_ICON_PATH
  };
  res.render(CARD_PAGE_VIEW_PATH + '.hbs', {
    ...props,
    cardPageSubtitle: CARD_PAGE_SUBTITLE
  });
};

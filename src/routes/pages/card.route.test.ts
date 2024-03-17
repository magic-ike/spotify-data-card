import request from 'supertest';
// @ts-ignore
import app from '../../../dist/app';
import {
  CARD_PAGE_SUBTITLE,
  CARD_PATH,
  SITE_TITLE
} from '../../utils/constant.util';

describe('GET ' + CARD_PATH, () => {
  describe('a successful response', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app).get(CARD_PATH);
    });

    it('should have a 200 status code', () => {
      expect(response.statusCode).toBe(200);
    });

    it('should specify html in the content type header', () => {
      expect(response.headers['content-type']).toContain('html');
    });

    it('should contain the site title and card page subtitle', () => {
      expect(response.text).toContain(SITE_TITLE && CARD_PAGE_SUBTITLE);
    });
  });
});

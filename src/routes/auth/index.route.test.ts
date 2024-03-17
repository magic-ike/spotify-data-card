import request from 'supertest';
// @ts-ignore
import app from '../../../dist/app';
import {
  AUTH_PATH,
  CALLBACK_PATH,
  LOGIN_PATH
} from '../../utils/constant.util';
import {
  SPOTIFY_AUTH_URL,
  AUTH_ERROR_MESSAGE,
  AUTH_STATE_COOKIE_KEY
} from '../../controllers/auth/index.controller';

describe('GET ' + AUTH_PATH + LOGIN_PATH, () => {
  describe('a successful response', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app).get(AUTH_PATH + LOGIN_PATH);
    });

    it('should have a 302 status code', () => {
      expect(response.statusCode).toBe(302);
    });

    it('should redirect to the Spotify auth page with the required query params', () => {
      expect(response.headers['location']).toContain(
        SPOTIFY_AUTH_URL &&
          'client_id' &&
          'response_type' &&
          'redirect_uri' &&
          'scope' &&
          'state'
      );
    });
  });
});

describe('GET ' + AUTH_PATH + CALLBACK_PATH, () => {
  describe('a response when an error query param is present', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app).get(
        AUTH_PATH + CALLBACK_PATH + '?error=error'
      );
    });

    it('should have a 302 status code', () => {
      expect(response.statusCode).toBe(302);
    });

    it('should redirect to the home page with an error message', () => {
      expect(response.headers['location']).toBe('/#error=error');
    });
  });

  describe('a response when there is a state mismatch', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .get(AUTH_PATH + CALLBACK_PATH + '?state=state1')
        .set('cookie', AUTH_STATE_COOKIE_KEY + '=state2');
    });

    it('should have a 302 status code', () => {
      expect(response.statusCode).toBe(302);
    });

    it('should redirect to the home page with a "state mismatch" error message', () => {
      expect(response.headers['location']).toBe(
        '/#error=' + AUTH_ERROR_MESSAGE.STATE_MISMATCH
      );
    });
  });

  describe('a response when the auth code query param is missing', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .get(AUTH_PATH + CALLBACK_PATH + '?state=state')
        .set('cookie', AUTH_STATE_COOKIE_KEY + '=state');
    });

    it('should have a 302 status code', () => {
      expect(response.statusCode).toBe(302);
    });

    it('should redirect to the home page with a "missing auth code" error message', () => {
      expect(response.headers['location']).toBe(
        '/#error=' + AUTH_ERROR_MESSAGE.MISSING_AUTH_CODE
      );
    });
  });

  describe('a response when the auth code query param is invalid', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .get(AUTH_PATH + CALLBACK_PATH + '?state=state&code=invalid')
        .set('cookie', AUTH_STATE_COOKIE_KEY + '=state');
    });

    it('should have a 302 status code', () => {
      expect(response.statusCode).toBe(302);
    });

    it('should redirect to the home page with an error message', () => {
      expect(response.headers['location']).toMatch(/^\/#error=/);
    });
  });
});

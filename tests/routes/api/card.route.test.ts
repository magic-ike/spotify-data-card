import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../src/app';
import Redis from '../../../src/models/redis.model';
import TokenMap from '../../../src/models/token-map.model';
import { MONGODB_URI } from '../../../src/config/index.config';
import { API_PATH, CARD_PATH } from '../../../src/utils/constant.util';
import {
  CARD_API_DELETION_SUCCESS_MESSAGE,
  CARD_API_ERROR_MESSAGE
} from '../../../src/controllers/api/card.controller';

describe('GET ' + API_PATH + CARD_PATH, () => {
  describe('a successful response', () => {
    let response: request.Response;

    beforeAll(async () => {
      await Redis.connect();
      response = await request(app).get(API_PATH + CARD_PATH);
    });

    afterAll(() => {
      Redis.quit();
    });

    it('should have a 200 status code', () => {
      expect(response.statusCode).toBe(200);
    });

    it('should specify svg in the content type header', () => {
      expect(response.headers['content-type']).toContain('svg');
    });
  });
});

describe('DELETE ' + API_PATH + CARD_PATH, () => {
  describe('a successful response', () => {
    let response: request.Response;

    beforeAll(async () => {
      await mongoose.connect(MONGODB_URI);
      await Redis.connect();
      await TokenMap.saveTokenMap('123', '123', '123', 123);
      response = await request(app)
        .delete(API_PATH + CARD_PATH + '?user_id=123')
        .set('authorization', 'bearer 123');
    });

    afterAll(() => {
      mongoose.connection.close();
      Redis.quit();
    });

    it('should have a 200 status code', () => {
      expect(response.statusCode).toBe(200);
    });

    it('should contain a success message', () => {
      expect(response.text).toBe(CARD_API_DELETION_SUCCESS_MESSAGE);
    });
  });

  describe('a response when the user id is missing', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app).delete(API_PATH + CARD_PATH);
    });

    it('should have a 400 status code', () => {
      expect(response.statusCode).toBe(400);
    });

    it('should contain a "missing user id" error message', () => {
      expect(response.text).toBe(CARD_API_ERROR_MESSAGE.NO_USER_ID);
    });
  });

  describe('a response when the auth header is missing', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app).delete(
        API_PATH + CARD_PATH + '?user_id=12146253656'
      );
    });

    it('should have a 401 status code', () => {
      expect(response.statusCode).toBe(401);
    });

    it('should contain a "missing token" error message', () => {
      expect(response.text).toBe(CARD_API_ERROR_MESSAGE.NO_TOKEN);
    });
  });

  describe('a response when the auth header scheme is invalid', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .delete(API_PATH + CARD_PATH + '?user_id=12146253656')
        .set('authorization', 'basic 123');
    });

    it('should have a 400 status code', () => {
      expect(response.statusCode).toBe(400);
    });

    it('should contain an "invalid auth" error message', () => {
      expect(response.text).toBe(CARD_API_ERROR_MESSAGE.INVALID_AUTH);
    });
  });

  describe('a response when the refresh token is missing', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .delete(API_PATH + CARD_PATH + '?user_id=12146253656')
        .set('authorization', 'bearer  ');
    });

    it('should have a 400 status code', () => {
      expect(response.statusCode).toBe(400);
    });

    it('should contain an "invalid auth" error message', () => {
      expect(response.text).toBe(CARD_API_ERROR_MESSAGE.INVALID_AUTH);
    });
  });

  describe('a response when the user id is not associated with a refresh token', () => {
    let response: request.Response;

    beforeAll(async () => {
      response = await request(app)
        .delete(API_PATH + CARD_PATH + '?user_id=123')
        .set('authorization', 'bearer 123');
    });

    it('should have a 404 status code', () => {
      expect(response.statusCode).toBe(404);
    });

    it('should contain a "card not found" error message', () => {
      expect(response.text).toBe(CARD_API_ERROR_MESSAGE.CARD_NOT_FOUND);
    });
  });

  describe('a response when the refresh token is invalid', () => {
    let response: request.Response;

    beforeAll(async () => {
      await mongoose.connect(MONGODB_URI);
      response = await request(app)
        .delete(API_PATH + CARD_PATH + '?user_id=12146253656')
        .set('authorization', 'bearer 123');
    });

    afterAll(() => {
      mongoose.connection.close();
    });

    it('should have a 401 status code', () => {
      expect(response.statusCode).toBe(401);
    });

    it('should contain an "invalid token" error message', () => {
      expect(response.text).toBe(CARD_API_ERROR_MESSAGE.INVALID_TOKEN);
    });
  });
});

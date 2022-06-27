import request from 'supertest';
import app from '../../../src/app';
import { API_PATH } from '../../../src/utils/constant.util';

describe(`GET ${API_PATH}`, () => {
  let response: request.Response;

  beforeEach(async () => {
    response = await request(app).get(API_PATH);
  });

  it('should respond with a 404 status code', () => {
    expect(response.statusCode).toBe(404);
  });

  it('should specify text/plain in the content type header', () => {
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('text/plain')
    );
  });
});

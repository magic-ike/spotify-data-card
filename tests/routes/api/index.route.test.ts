import request from 'supertest';
// @ts-ignore
import app from '../../../dist/app';
// @ts-ignore
import { API_PATH } from '../../../dist/utils/constant.util';

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

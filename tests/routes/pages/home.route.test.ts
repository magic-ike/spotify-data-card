import request from 'supertest';
// @ts-ignore
import app from '../../../dist/app';

describe('GET /', () => {
  let response: request.Response;

  beforeEach(async () => {
    response = await request(app).get('/');
  });

  it('should respond with a 200 status code', () => {
    expect(response.statusCode).toBe(200);
  });

  it('should specify text/html in the content type header', () => {
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('text/html')
    );
  });
});

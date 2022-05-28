import request from 'supertest';
import app from '../../../src/app';

describe('GET /api', () => {
  let response: request.Response;

  beforeEach(async () => {
    response = await request(app).get('/api');
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

/**
 * according to the dotenv docs and "The Twelve-Factor App" methodology, an app's config (stored in environment variables) is
 * unique to each environment and should be kept separate from code. therefore:
 *   1. there should only be 1 `.env` file per environement: https://github.com/motdotla/dotenv#should-i-have-multiple-env-files
 *   2. `.env` files should never be committed to version control: https://github.com/motdotla/dotenv#should-i-commit-my-env-file
 * `.env.example` files are an obvious exception. further reading: https://12factor.net/config
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import app from './app';
import { MONGODB_URI, REDIS_URI, PORT } from './utils/config.util';

const redisClient = createClient({ url: REDIS_URI });

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    return redisClient.connect();
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`running server on http://localhost:${PORT}`)
    );
  })
  .catch((error) => console.log(error));

// redis utils

export { redisClient };

export function getFromOrSaveToCache<T>(
  key: string,
  callback: Function,
  expiration?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    // attempt to fetch from cache
    let data = null;
    try {
      data = await redisClient.get(key);
    } catch (error) {
      console.log(error);
    }
    if (data !== null) {
      resolve(JSON.parse(data));
      return;
    }

    // run callback
    let freshData;
    try {
      freshData = await callback();
    } catch (error) {
      reject(error);
      return;
    }
    resolve(freshData);

    // save to cache
    try {
      if (typeof expiration === 'number') {
        await redisClient.setEx(key, expiration, JSON.stringify(freshData));
      } else {
        await redisClient.set(key, JSON.stringify(freshData));
      }
    } catch (error) {
      console.log(error);
    }
  });
}

/**
 * according to the dotenv docs and "The Twelve-Factor App" methodology, an app's config (stored in environment variables) is
 * unique to each environment and should be kept separate from code. therefore:
 *   1. there should only be 1 `.env` file per environement: https://github.com/motdotla/dotenv#should-i-have-multiple-env-files
 *   2. `.env` files should never be committed to version control: https://github.com/motdotla/dotenv#should-i-commit-my-env-file
 * `.env.example` files are an obvious exception. further reading: https://12factor.net/config
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Redis from './models/redis.model';
import app from './app';
import { MONGODB_URI, PORT } from './config/index.config';

mongoose
  .connect(MONGODB_URI)
  .then(() => Redis.connect())
  .then(() =>
    app.listen(PORT, () =>
      console.log(`running server on http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(error));

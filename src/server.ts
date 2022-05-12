/**
 * according to the dotenv docs and the "The Twelve-Factor App" methodology, app config (stored in env vars) is unique to each
 * environment and should be kept separate from code. therefore:
 *   1. there should only be 1 `.env` file per environement: https://github.com/motdotla/dotenv#should-i-have-multiple-env-files
 *   2. `.env` files should never be committed to version control: https://github.com/motdotla/dotenv#should-i-commit-my-env-file
 * further reading: https://12factor.net/config
 */
import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
  console.log(`running server on http://localhost:${PORT}`)
);

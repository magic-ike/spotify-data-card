/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  setupFiles: ['dotenv/config', '<rootDir>/.jest/set-env-vars.js']
};

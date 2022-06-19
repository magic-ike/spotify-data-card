/**
 * `accessTokenExpiresAt` is stored as a date string in mongo and redis but
 * should be converted to miliseconds as soon as the token map gets fetched
 */
export default interface ITokenMap {
  userId: string;
  refreshToken: string;
  accessToken: string;
  accessTokenExpiresAt: Number | string;
}

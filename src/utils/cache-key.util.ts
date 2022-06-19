// token maps
export const getTokenMapCacheKey = (userId: string) => `tokenMaps:${userId}`;

// users
export const getProfileCacheKey = (userId: string) => `profiles:${userId}`;
export const getTopTracksCacheKey = (
  userId: string,
  hideExplicit: boolean,
  limit: number
) => `topTracks:${userId}${hideExplicit ? ':hideExp' : ':showExp'}:${limit}`;
export const getTopArtistsCacheKey = (userId: string, limit: number) =>
  `topArtists:${userId}:${limit}`;

// images
export const getImagesCacheKey = (imageId: string) => `images:${imageId}`;

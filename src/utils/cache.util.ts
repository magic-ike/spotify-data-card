const TOKEN_MAPS = 'tokenMaps:';
const PROFILES = 'profiles:';
const TOP_TRACKS = 'topTracks:';
const HIDE_EXPLICIT = 'hideExp:';
const SHOW_EXPLICIT = 'showExp:';
const TOP_ARTISTS = 'topArtists:';
const IMAGES = 'images:';

// keys

export const getTokenMapCacheKey = (userId: string) => {
  return TOKEN_MAPS + userId;
};

export const getProfileCacheKey = (userId: string) => {
  return PROFILES + userId;
};

export const getTopTracksCacheKey = (
  userId: string,
  hideExplicit: boolean,
  limit: number
) => {
  return (
    TOP_TRACKS +
    `${userId}:` +
    (hideExplicit ? HIDE_EXPLICIT : SHOW_EXPLICIT) +
    limit
  );
};

export const getTopArtistsCacheKey = (userId: string, limit: number) => {
  return TOP_ARTISTS + `${userId}:` + limit;
};

export const getImagesCacheKey = (imageId: string) => {
  return IMAGES + imageId;
};

// command args

export const getTopItemCacheDeletionScript = (
  userId: string,
  type: 'Track' | 'Artist'
): string => {
  return `for _, k in ipairs(redis.call('keys', '${
    type === 'Track' ? TOP_TRACKS : TOP_ARTISTS
  }${userId}:*')) do redis.call('del', k) end`;
};

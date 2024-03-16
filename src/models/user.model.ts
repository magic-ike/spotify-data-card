import axios, { AxiosError } from 'axios';
import Redis from './redis.model';
import UserProfileResponseBody from '../interfaces/user-profile-response-body.interface';
import CurrentlyPlayingResponseBody from '../interfaces/currently-playing-response-body.interface';
import RecentlyPlayedResponseBody from '../interfaces/recently-played-response-body.interface';
import TopItemsResponseBody from '../interfaces/top-items-response-body.interface';
import TrackResponseBody from '../interfaces/track-response-body.interface';
import ArtistResponseBody from '../interfaces/artist-response-body.interface';
import Track from '../interfaces/track.interface';
import Artist from '../interfaces/artist.interface';

const PROFILE_ENDPOINT = 'https://api.spotify.com/v1/me';
const NOW_PLAYING_ENDPOINT = `${PROFILE_ENDPOINT}/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `${PROFILE_ENDPOINT}/player/recently-played`;
const TOP_TRACKS_ENDPOINT = `${PROFILE_ENDPOINT}/top/tracks`;
const TOP_ARTISTS_ENDPOINT = `${PROFILE_ENDPOINT}/top/artists`;
const DEFAULT_LIMIT = 20;

export default class User {
  static async getUserProfile(
    accessToken: string,
    userId?: string
  ): Promise<UserProfileResponseBody> {
    // attempt to fetch profile from cache
    let cachedProfile = null;
    if (userId) {
      try {
        cachedProfile = await Redis.getUserProfileFromCache(userId);
      } catch (error) {
        console.log(error);
      }
    }

    // fetch profile from spotify api if necessary
    let profile;
    let fetchedUserId = null;
    if (cachedProfile !== null) {
      profile = cachedProfile;
    } else {
      let response;
      try {
        response = await axios.get<UserProfileResponseBody>(PROFILE_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        throw (error as AxiosError).message;
      }
      const { id, display_name } = response.data;
      profile = { id, display_name };
      fetchedUserId = id;
    }

    // save profile to cache if necessary
    if (fetchedUserId !== null) {
      try {
        Redis.saveUserProfileToCache(fetchedUserId, profile);
      } catch (error) {
        console.log(error);
      }
    }

    // resolve with profile
    return profile;
  }

  static async getNowPlaying(
    accessToken: string,
    hideExplicit: boolean
  ): Promise<Track | null> {
    // fetch currently playing track
    let response;
    try {
      response = await axios.get<CurrentlyPlayingResponseBody>(
        NOW_PLAYING_ENDPOINT,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    } catch (error) {
      throw (error as AxiosError).message;
    }

    // check if a track can be shown
    const data = response.data;
    if (
      !data ||
      !data.item ||
      !data.is_playing ||
      (hideExplicit && data.item.explicit)
    ) {
      return null;
    }

    // resolve with track
    const trackData = data.item;
    return {
      title: trackData.name,
      artist: trackData.artists.map((_artist) => _artist.name).join(', '),
      albumTitle: trackData.album.name,
      albumImageUrl: trackData.album.images[2].url,
      explicit: trackData.explicit,
      url: trackData.external_urls.spotify
    };
  }

  static async getRecentlyPlayed(
    accessToken: string,
    hideExplicit: boolean,
    limit: number
  ): Promise<Track[]> {
    // fetch recently played tracks
    let response;
    try {
      response = await axios.get<RecentlyPlayedResponseBody>(
        `${RECENTLY_PLAYED_ENDPOINT}?limit=${
          hideExplicit ? DEFAULT_LIMIT : limit
        }`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    } catch (error) {
      throw (error as AxiosError).message;
    }

    // hide explicit tracks if necessary
    let trackDataArray = response.data.items.map((item) => item.track);
    if (hideExplicit) {
      trackDataArray = trackDataArray.filter(
        (trackData) => !trackData.explicit
      );
    }

    // resolve with tracks
    return trackDataArray.slice(0, limit).map((trackData) => ({
      title: trackData.name,
      artist: trackData.artists.map((_artist) => _artist.name).join(', '),
      albumTitle: trackData.album.name,
      albumImageUrl: trackData.album.images[2].url,
      explicit: trackData.explicit,
      url: trackData.external_urls.spotify
    }));
  }

  static async getTopTracks(
    userId: string,
    accessToken: string,
    hideExplicit: boolean,
    limit: number
  ): Promise<Track[]> {
    return Redis.getTopTracksFromCacheOrGetAndSaveToCache(
      userId,
      hideExplicit,
      limit,
      async () => {
        // fetch top tracks
        let response;
        try {
          response = await axios.get<TopItemsResponseBody>(
            `${TOP_TRACKS_ENDPOINT}?limit=${
              hideExplicit ? DEFAULT_LIMIT : limit
            }`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        } catch (error) {
          throw (error as AxiosError).message;
        }

        // hide explicit tracks if necessary
        let trackDataArray = response.data.items as TrackResponseBody[];
        if (hideExplicit) {
          trackDataArray = trackDataArray.filter(
            (trackData) => !trackData.explicit
          );
        }

        // resolve with tracks
        return trackDataArray.slice(0, limit).map((trackData) => ({
          title: trackData.name,
          artist: trackData.artists.map((_artist) => _artist.name).join(', '),
          albumTitle: trackData.album.name,
          albumImageUrl: trackData.album.images[2].url,
          explicit: trackData.explicit,
          url: trackData.external_urls.spotify
        }));
      }
    );
  }

  static async getTopArtists(
    userId: string,
    accessToken: string,
    limit: number
  ): Promise<Artist[]> {
    return Redis.getTopArtistsFromCacheOrGetAndSaveToCache(
      userId,
      limit,
      async () => {
        // fetch top artists
        let response;
        try {
          response = await axios.get<TopItemsResponseBody>(
            `${TOP_ARTISTS_ENDPOINT}?limit=${limit}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        } catch (error) {
          throw (error as AxiosError).message;
        }

        // resolve with artists
        const artistDataArray = response.data.items as ArtistResponseBody[];
        return artistDataArray.map((artistData) => ({
          name: artistData.name,
          imageUrl: artistData.images[2].url,
          url: artistData.external_urls.spotify
        }));
      }
    );
  }
}

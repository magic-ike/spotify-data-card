import Track from './track.interface';
import Artist from './artist.interface';
import StringMap from './map.interface';

export default interface DataCardProps {
  userDisplayName: string;
  customTitle?: string;
  showTitle: boolean;
  nowPlaying: Track | null;
  recentlyPlayed: Track[];
  topTracks: Track[];
  topArtists: Artist[];
  imageDataMap: StringMap;
  showNowPlaying: boolean;
  showRecentlyPlayed: boolean;
  showTopTracks: boolean;
  showTopArtists: boolean;
  hideExplicit: boolean;
  showBorder: boolean;
  itemLimit: number;
  errorMessage?: string;
}

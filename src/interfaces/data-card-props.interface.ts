import Track from './track.interface';
import Artist from './artist.interface';

export default interface DataCardProps {
  userDisplayName: string;
  nowPlaying: Track | null;
  topTracks: Track[];
  topArtists: Artist[];
  hideTitle: boolean;
  customTitle?: string;
  errorMessage?: string;
}

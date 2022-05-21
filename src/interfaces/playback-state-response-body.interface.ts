import TrackResponseBody from './track-response-body.interface';

export default interface PlaybackStateResponseBody {
  is_playing: boolean;
  item: TrackResponseBody | null;
}

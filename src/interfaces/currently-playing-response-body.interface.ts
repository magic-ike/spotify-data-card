import TrackResponseBody from './track-response-body.interface';

export default interface CurrentlyPlayingResponseBody {
  is_playing: boolean;
  item: TrackResponseBody | null;
}

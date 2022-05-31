import TrackResponseBody from './track-response-body.interface';

export default interface RecentlyPlayedResponseBody {
  items: { track: TrackResponseBody }[];
}

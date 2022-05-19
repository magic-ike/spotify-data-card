export default interface CardGetRequestQueryParams {
  user_id?: string;
  custom_title?: string;
  hide_title?: string;
  hide_now_playing?: string;
  hide_top_tracks?: string;
  hide_top_artists?: string;
  show_explicit_tracks?: string;
  track_count?: string; // default: 3, min: 1, max: 3
  artist_count?: string; // default: 3, min: 1, max: 3
}

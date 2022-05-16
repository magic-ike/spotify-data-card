export default interface CardRequest {
  user_id: string;
  hide_now_playing?: string;
  hide_top_tracks?: string;
  hide_top_artists?: string;
  show_explicit_tracks?: string;
}

export type Platform =
  | 'pc_steam'
  | 'pc_battlenet'
  | 'ps5'
  | 'xbox'
  | 'switch'
  | 'other'

export type Status =
  | 'wishlist'
  | 'backlog'
  | 'playing'
  | 'completed'
  | 'abandoned'

export type Source = 'steam' | 'manual'

export interface Game {
  id: number
  steam_appid: number | null
  title: string
  platform: Platform
  status: Status
  playtime_minutes: number
  rating: number | null
  genres: string[] | null
  cover_url: string | null
  notes: string | null
  source: Source
  date_added: string
  date_completed: string | null
}

import type { Game, GameFormInput } from './types'

export async function fetchGames(): Promise<Game[]> {
  const res = await fetch('/api/games')
  if (!res.ok) throw new Error(`Failed to fetch games: ${res.status}`)
  return res.json()
}

export async function createGame(input: GameFormInput): Promise<Game> {
  const res = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to create game: ${res.status}`)
  return res.json()
}

export async function updateGame(id: number, input: GameFormInput): Promise<Game> {
  const res = await fetch(`/api/games/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to update game: ${res.status}`)
  return res.json()
}

export async function deleteGame(id: number): Promise<void> {
  const res = await fetch(`/api/games/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete game: ${res.status}`)
}

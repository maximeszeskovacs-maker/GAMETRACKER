import { useQuery } from '@tanstack/react-query'
import { fetchGames } from '../api/games'

function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1)
}

function Library() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  })

  if (isLoading) return <p>Loading games…</p>
  if (isError) return <p>Failed to load games: {error.message}</p>
  if (!data || data.length === 0) return <p>No games yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Platform</th>
          <th>Status</th>
          <th>Hours</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        {data.map((game) => (
          <tr key={game.id}>
            <td>{game.title}</td>
            <td>{game.platform}</td>
            <td>{game.status}</td>
            <td>{formatHours(game.playtime_minutes)}</td>
            <td>{game.rating ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Library

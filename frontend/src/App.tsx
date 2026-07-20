import { useQuery } from '@tanstack/react-query'

interface HealthResponse {
  status: string
}

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health')
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

function App() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  })

  return (
    <main>
      <h1>Game Backlog Manager</h1>
      {isLoading && <p>Checking backend…</p>}
      {isError && <p>Backend: unreachable ({error.message})</p>}
      {data && <p>Backend: {data.status}</p>}
    </main>
  )
}

export default App

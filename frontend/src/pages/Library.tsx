import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGame, deleteGame, fetchGames, updateGame } from '../api/games'
import type { Game, GameFormInput } from '../api/types'
import GameFormModal from '../components/GameFormModal'

function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1)
}

type ModalState = { mode: 'create' } | { mode: 'edit'; game: Game } | null

function Library() {
  const [modalState, setModalState] = useState<ModalState>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  })

  function invalidateGames() {
    queryClient.invalidateQueries({ queryKey: ['games'] })
  }

  const createMutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      invalidateGames()
      setModalState(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: GameFormInput }) =>
      updateGame(id, input),
    onSuccess: () => {
      invalidateGames()
      setModalState(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGame,
    onSuccess: invalidateGames,
  })

  function handleSubmit(input: GameFormInput) {
    if (modalState?.mode === 'edit') {
      updateMutation.mutate({ id: modalState.game.id, input })
    } else {
      createMutation.mutate(input)
    }
  }

  function handleDelete(game: Game) {
    if (window.confirm(`Delete "${game.title}"?`)) {
      deleteMutation.mutate(game.id)
    }
  }

  return (
    <>
      <div className="toolbar">
        <button onClick={() => setModalState({ mode: 'create' })}>
          Add game
        </button>
      </div>

      {isLoading && <p>Loading games…</p>}
      {isError && <p>Failed to load games: {error.message}</p>}
      {data && data.length === 0 && <p>No games yet.</p>}

      {data && data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Hours</th>
              <th>Rating</th>
              <th></th>
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
                <td>
                  <button
                    onClick={() => setModalState({ mode: 'edit', game })}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(game)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalState && (
        <GameFormModal
          game={modalState.mode === 'edit' ? modalState.game : undefined}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  )
}

export default Library

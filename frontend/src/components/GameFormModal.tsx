import { useState, type FormEvent } from 'react'
import type { Game, GameFormInput, Platform, Status } from '../api/types'

const PLATFORMS: Platform[] = [
  'pc_steam',
  'pc_battlenet',
  'ps5',
  'xbox',
  'switch',
  'other',
]

const STATUSES: Status[] = [
  'wishlist',
  'backlog',
  'playing',
  'completed',
  'abandoned',
]

interface GameFormModalProps {
  game?: Game
  isSubmitting: boolean
  onSubmit: (input: GameFormInput) => void
  onClose: () => void
}

function GameFormModal({
  game,
  isSubmitting,
  onSubmit,
  onClose,
}: GameFormModalProps) {
  const [title, setTitle] = useState(game?.title ?? '')
  const [platform, setPlatform] = useState<Platform>(
    game?.platform ?? 'pc_steam',
  )
  const [status, setStatus] = useState<Status>(game?.status ?? 'backlog')
  const [rating, setRating] = useState(game?.rating?.toString() ?? '')
  const [notes, setNotes] = useState(game?.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setError(null)
    onSubmit({
      title: title.trim(),
      platform,
      status,
      rating: rating === '' ? null : Number(rating),
      notes: notes.trim() === '' ? null : notes.trim(),
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{game ? 'Edit game' : 'Add game'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </label>

          <label>
            Platform
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            Rating (1-10)
            <input
              type="number"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </label>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GameFormModal

import { Router } from 'express'
import GuessedSongController from '../controllers/GuessedSongController'

const router = Router()

router.get('/api/v1/guessed_songs', GuessedSongController.getGuessedSongs)
router.get('/api/v1/guessed_songs/:id', GuessedSongController.getGuessedSong)

export default router

// src/routes/guessed_song.ts

import { Router } from 'express'
import GuessedSongController from '../controllers/GuessedSongController'

const router = Router()

router.get('/guessed_songs', GuessedSongController.getGuessedSongs)
router.get('/guessed_songs/:id', GuessedSongController.getGuessedSong)

export default router

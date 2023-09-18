import { requireCsrf } from '../middlewares/csrfMiddleware'
import express from 'express'
import SongController from '../controllers/SongController'

const router = express.Router()

// router.get('/api/v1/songs/', SongController.getSongs)
// router.get('/api/v1/songs/:id', SongController.getSong)
router.get(
    '/api/v1/songs/credentials/:id',
    SongController.getSongCredentialsById
)
router.get('/api/v1/songs/playlist/:playlistId', async (req, res) => {
    try {
        const songsList =
            await SongController.fetchAndStoreSongsFromSpotifyPlaylist(req, res)
        res.json(songsList)
    } catch (error) {
        console.log(
            `Error caught in '/api/v1/songs/:playlistId' route: ${error}`
        )
        res.status(500).json({ error: error.toString() })
    }
})

export default router

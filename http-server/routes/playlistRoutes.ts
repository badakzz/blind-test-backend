import { requirePremium } from './../middlewares/premiumMiddleware'
import { Router } from 'express'
import axios from 'axios'
import PlaylistController from '../controllers/PlaylistController'

const router = Router()
router.get('/api/v1/playlists', async (req, res) => {
    try {
        const playlistList =
            await PlaylistController.fetchGenresAndStorePlaylists(req)
        res.json(playlistList)
    } catch (error) {
        console.log(`Error caught in '/api/v1/playlists' route: ${error}`)
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/v1/playlists/search', requirePremium, async (req, res) => {
    try {
        const playlistList = await PlaylistController.searchPlaylist(req)
        res.json(playlistList)
    } catch (error) {
        console.error(
            `Error caught in '/api/v1/playlists/search' route: ${error}`
        )
        res.status(500).json({ error: error.toString() })
    }
})

export default router

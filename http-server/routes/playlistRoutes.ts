import { Router } from 'express'
import PlaylistController from '../controllers/PlaylistController'

const router = Router()

router.get('/api/v1/playlists', PlaylistController.getPlaylists)
router.get('/api/v1/playlists/:id', PlaylistController.getPlaylist)

export default router

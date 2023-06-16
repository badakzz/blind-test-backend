import { Router } from 'express'
import PlaylistController from '../controllers/PlaylistController'

const router = Router()

router.get('/playlists', PlaylistController.getPlaylists)
router.get('/playlists/:id', PlaylistController.getPlaylist)

export default router

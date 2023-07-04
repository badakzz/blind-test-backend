import { requireAuth } from './../middlewares/authMiddleware'
import { Router } from 'express'
import ChatroomController from '../controllers/ChatroomController'
import { requireCsrf } from '../middlewares/csrfMiddleware'

const router = Router()

router.get('/api/v1/chatrooms', ChatroomController.getChatrooms)
router.get('/api/v1/chatrooms/:id', ChatroomController.getChatroom)
router.post('/api/v1/chatrooms', requireCsrf, ChatroomController.createChatroom)
router.delete(
    '/api/v1/chatrooms/:id',
    requireCsrf,
    requireAuth,
    ChatroomController.deleteChatroom
)
router.get(
    '/api/v1/chatrooms/:chatroom_id/current_song_playing_id',
    ChatroomController.getCurrentSongPlayingId
)
router.put(
    '/api/v1/chatrooms/:chatroom_id/current_song_playing_id',
    requireCsrf,
    ChatroomController.setCurrentSongPlaying
)

export default router

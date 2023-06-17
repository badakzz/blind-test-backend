import { requireAuth } from './../middlewares/authMiddleware'
import { Router } from 'express'
import ChatroomController from '../controllers/ChatroomController'
import CSRFController from '../controllers/CSRFController'

const router = Router()

router.get('/api/v1/chatrooms', ChatroomController.getChatrooms)
router.get('/api/v1/chatrooms/:id', ChatroomController.getChatroom)
router.post(
    '/api/v1/chatrooms',
    CSRFController.verifyCSRF,
    ChatroomController.createChatroom
)
router.delete(
    '/api/v1/chatrooms/:id',
    requireAuth,
    CSRFController.verifyCSRF,
    ChatroomController.deleteChatroom
)

export default router

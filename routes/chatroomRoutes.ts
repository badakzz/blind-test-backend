import { Router } from 'express'
import ChatroomController from '../controllers/ChatroomController'

const router = Router()

router.get('/api/v1/chatrooms', ChatroomController.getChatrooms)
router.get('/api/v1/chatrooms/:id', ChatroomController.getChatroom)
router.post('/api/v1/chatrooms', ChatroomController.createChatroom)
router.delete('/api/v1/chatrooms/:id', ChatroomController.deleteChatroom)

export default router

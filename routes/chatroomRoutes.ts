import { Router } from 'express'
import ChatroomController from '../controllers/ChatroomController'

const router = Router()

router.get('/chatrooms', ChatroomController.getChatrooms)
router.get('/chatrooms/:id', ChatroomController.getChatroom)
router.post('/chatrooms', ChatroomController.createChatroom)
router.delete('/chatrooms/:id', ChatroomController.deleteChatroom)

export default router

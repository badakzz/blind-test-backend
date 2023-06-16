import { Router } from 'express'
import ChatMessageController from '../controllers/ChatMessageController'

const router = Router()

router.get('/chat_messages/:id', ChatMessageController.getMessage)
router.post('/chat_messages', ChatMessageController.createMessage)
router.put('/chat_messages/:id', ChatMessageController.updateMessage)
router.delete('/chat_messages/:id', ChatMessageController.deleteMessage)

export default router

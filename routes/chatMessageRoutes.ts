import { requireAuth } from './../middlewares/authMiddleware'
import { Router } from 'express'
import ChatMessageController from '../controllers/ChatMessageController'
import CSRFController from '../controllers/CSRFController'

const router = Router()

router.get('/api/v1/chat_messages/:id', ChatMessageController.getMessage)
router.post(
    '/api/v1/chat_messages',
    CSRFController.verifyCSRF,
    ChatMessageController.createMessage
)
router.put(
    '/api/v1/chat_messages/:id',
    requireAuth,
    CSRFController.verifyCSRF,
    ChatMessageController.updateMessage
)
router.delete(
    '/api/v1/chat_messages/:id',
    CSRFController.verifyCSRF,
    ChatMessageController.deleteMessage
)

export default router

import { requireAuth } from './../middlewares/authMiddleware'
import { requireCsrf } from '../middlewares/csrfMiddleware'
import { Router } from 'express'
import ChatMessageController from '../controllers/ChatMessageController'

const router = Router()

router.get('/api/v1/chat_messages/:id', ChatMessageController.getMessage)
router.post(
    '/api/v1/chat_messages',
    requireCsrf,
    ChatMessageController.createMessage
)
router.put(
    '/api/v1/chat_messages/:id',
    requireCsrf,
    requireAuth,
    ChatMessageController.updateMessage
)
router.delete(
    '/api/v1/chat_messages/:id',
    requireCsrf,
    ChatMessageController.deleteMessage
)

export default router

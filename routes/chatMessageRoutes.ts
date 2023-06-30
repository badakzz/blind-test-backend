import { requireAuth } from './../middlewares/authMiddleware'
import { requireCsrf } from '../middlewares/csrfMiddleware'
import { Router } from 'express'
import ChatMessageController from '../controllers/ChatMessageController'
import { checkBlacklist } from '../middlewares/jwtBlacklistMiddleware'

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
    checkBlacklist,
    ChatMessageController.updateMessage
)
router.delete(
    '/api/v1/chat_messages/:id',
    // require adm
    requireCsrf,
    ChatMessageController.deleteMessage
)

export default router

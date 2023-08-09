import { Router } from 'express'
import ScoreController from '../controllers/ScoreController'

const router = Router()

router.get(
    '/api/v1/scores/chatroom/:chatroomId',
    ScoreController.getScoresByChatroom
)

export default router

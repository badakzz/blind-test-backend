import { Router } from 'express'
import ScoreboardController from '../controllers/ScoreboardController'

const router = Router()

router.get('/scoreboards', ScoreboardController.getScoreboards)
router.get('/scoreboards/:id', ScoreboardController.getScoreboard)
router.post('/scoreboards', ScoreboardController.createScore)

export default router

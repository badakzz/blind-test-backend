import { Router } from 'express'
import ScoreboardController from '../controllers/ScoreboardController'

const router = Router()

router.get('/api/v1/scoreboards', ScoreboardController.getScoreboards)
router.get('/api/v1/scoreboards/:id', ScoreboardController.getScoreboard)
router.post('/api/v1/scoreboards', ScoreboardController.createScore)

export default router

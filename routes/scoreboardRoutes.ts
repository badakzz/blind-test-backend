import { Router } from 'express'
import CSRFController from '../controllers/CSRFController'
import ScoreboardController from '../controllers/ScoreboardController'

const router = Router()

router.get('/api/v1/scoreboards', ScoreboardController.getScoreboards)
router.get('/api/v1/scoreboards/:id', ScoreboardController.getScoreboard)
router.post(
    '/api/v1/scoreboards',
    CSRFController.verifyCSRF,
    ScoreboardController.createScore
)

export default router

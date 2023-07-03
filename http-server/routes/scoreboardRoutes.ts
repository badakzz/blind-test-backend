import { Router } from 'express'
import ScoreboardController from '../controllers/ScoreboardController'
import { requireCsrf } from '../middlewares/csrfMiddleware'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.get('/api/v1/scoreboards', ScoreboardController.getScoreboards)
router.get('/api/v1/scoreboards/:id', ScoreboardController.getScoreboard)

router.put(
    '/api/v1/scoreboards/',
    requireAuth,
    requireCsrf,
    ScoreboardController.updateScoreboard
)
//  todo
// router.put(
//     '/api/v1/scoreboards/',
//     requireCsrf, requireAdm,
//     ScoreboardController.updateScoreboard
// )
router.post(
    '/api/v1/scoreboards',
    requireCsrf,
    ScoreboardController.createScore
)

export default router

import { Router } from "express"
import ScoreController from "../controllers/ScoreController"
import { requireCsrf } from "../middlewares/csrfMiddleware"
import { requireAuth } from "../middlewares/authMiddleware"

const router = Router()

router.get(
    "/api/v1/scores/chatroom/:chatroomId",
    ScoreController.getScoresByChatroom
)

// router.get('/api/v1/scores', ScoreController.getScores)
// router.get('/api/v1/scores/:id', ScoreController.getScore)

// router.put(
//     '/api/v1/scores/',
//     requireAuth,
//     requireCsrf,
//     ScoreController.updateScore
// )
//  todo
// router.put(
//     '/api/v1/scores/',
//     requireCsrf, requireAdm,
//     ScoreController.updateScore
// )
router.post("/api/v1/scores", requireCsrf, ScoreController.createScore)

export default router

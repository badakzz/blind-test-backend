import { Router } from 'express'
import ScoreboardController from '../controllers/ScoreboardController'
import { requireCsrf } from '../middlewares/csrfMiddleware'
import csrf from 'csurf'
import { requireAuth } from '../middlewares/authMiddleware'
import { checkBlacklist } from '../middlewares/jwtBlacklistMiddleware'

const csrfProtection = csrf({
    cookie: {
        key: process.env.COOKIE_PARSER_SECRET,
        sameSite: 'lax', // this and
        httpOnly: true, // this config need to stay or client wont be able to validate token
        signed: false,
        // secure: process.env.NODE_ENV === 'production'
    },
    value: (req) => {
        console.log('CSRF token from client:', req.headers['x-csrf-token'])
        return req.headers['x-csrf-token']
    },
})

const router = Router()

router.get('/api/v1/scoreboards', ScoreboardController.getScoreboards)
router.get('/api/v1/scoreboards/:id', ScoreboardController.getScoreboard)

router.put(
    '/api/v1/scoreboards/',
    requireAuth,
    csrfProtection,
    checkBlacklist,
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

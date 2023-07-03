import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'
import { requireCsrf } from '../middlewares/csrfMiddleware'
// import csrf from 'csurf'

const router = Router()

// const csrfProtection = csrf({
//     cookie: {
//         key: process.env.COOKIE_PARSER_SECRET,
//         sameSite: 'lax', // this and
//         httpOnly: true, // this config need to stay or client wont be able to validate token
//         signed: false,
//         // secure: process.env.NODE_ENV === 'production'
//     },
// })

router.get('/api/v1/users/:id', requireAuth, UserController.getUser)
router.post('/api/v1/users', requireCsrf, UserController.createUser)
router.put(
    '/api/v1/users/:id',
    requireCsrf,
    requireAuth,
    UserController.updateUser
)
router.patch(
    '/api/v1/users/:id',
    requireCsrf,
    requireAuth,
    UserController.partialUpdateUser
)
router.delete(
    'api/v1/users/:id',
    requireCsrf,
    requireAuth,
    UserController.deleteUser
)
router.post('/api/auth/login', AuthController.login)
router.post('/api/auth/signup', AuthController.signup)
router.post('/api/auth/logout', requireCsrf, requireAuth, AuthController.logout)

export default router

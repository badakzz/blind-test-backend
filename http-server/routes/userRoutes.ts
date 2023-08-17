import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'
import { requireCsrf } from '../middlewares/csrfMiddleware'

const router = Router()

router.get('/api/v1/users/:id', UserController.getUser)
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

router.post('/api/auth/login', requireCsrf, AuthController.login)
router.post('/api/auth/signup', requireCsrf, AuthController.signup)
router.put(
    '/api/v1/users/premium/:user_id',
    requireCsrf,
    requireAuth,
    UserController.grantPremium
)
router.post(
    '/api/auth/settings',
    requireCsrf,
    requireAuth,
    AuthController.updateSettings
)

export default router

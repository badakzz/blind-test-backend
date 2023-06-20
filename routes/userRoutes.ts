import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'
import { requireCsrf } from '../middlewares/csrfMiddleware'

const router = Router()

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
router.get('/api/auth/check', AuthController.checkAuthentication)

export default router

import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'
import CSRFController from '../controllers/CSRFController'

const router = Router()

router.get('/api/v1/users/:id', requireAuth, UserController.getUser)
router.post(
    '/api/v1/users',
    CSRFController.verifyCSRF,
    UserController.createUser
)
router.put(
    '/api/v1/users/:id',
    requireAuth,
    CSRFController.verifyCSRF,
    UserController.updateUser
)
router.delete(
    'api/v1/users/:id',
    requireAuth,
    CSRFController.verifyCSRF,
    UserController.deleteUser
)
router.post('/api/auth/login', CSRFController.verifyCSRF, AuthController.login)
router.post(
    '/api/auth/signup',
    CSRFController.verifyCSRF,
    AuthController.signup
)
router.post(
    '/api/auth/logout',
    CSRFController.verifyCSRF,
    AuthController.logout
)

export default router

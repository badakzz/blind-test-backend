import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.get('/api/v1/users/:id', requireAuth, UserController.getUser)
router.post('/api/v1/users', UserController.createUser)
router.put('/api/v1/users/:id', requireAuth, UserController.updateUser)
router.delete('api/v1/users/:id', requireAuth, UserController.deleteUser)
router.post('/api/auth/login', AuthController.login)
router.post('/api/auth/signup', AuthController.signup)
router.post('/api/auth/logout', AuthController.logout)

export default router

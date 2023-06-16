import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.get('/users/:id', requireAuth, UserController.getUser)
router.post('/users', UserController.createUser)
router.put('/users/:id', requireAuth, UserController.updateUser)
router.delete('/users/:id', requireAuth, UserController.deleteUser)
router.post('/login', AuthController.login)
router.post('/signup', AuthController.signup)
router.post('/logout', AuthController.logout)

export default router

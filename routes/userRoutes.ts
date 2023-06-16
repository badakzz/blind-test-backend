import { Router } from 'express'
import UserController from '../controllers/UserController'
import AuthController from '../controllers/AuthController'

const router = Router()

router.get('/users/:id', UserController.getUser)
router.post('/users', UserController.createUser)
router.put('/users/:id', UserController.updateUser)
router.delete('/users/:id', UserController.deleteUser)
router.post('/login', AuthController.login)
router.post('/signup', AuthController.signup)

export default router

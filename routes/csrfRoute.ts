import { Router } from 'express'
import CSRFController from '../controllers/CSRFController'

const router = Router()

router.get('/api/auth/csrf', CSRFController.getCSRF)

export default router

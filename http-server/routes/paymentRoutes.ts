import { requireAuth } from './../middlewares/authMiddleware'
import { requireCsrf } from './../middlewares/csrfMiddleware'
import express from 'express'
import PaymentController from '../controllers/PaymentController'

const router = express.Router()

router.post(
    '/api/v1/payment_intents',
    requireCsrf,
    requireAuth,
    PaymentController.createPaymentIntent
)
router.post(
    '/api/v1/confirm_payment',
    requireCsrf,
    requireAuth,
    PaymentController.confirmPayment
)

export default router

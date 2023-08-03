import { Request, Response } from 'express'
import Payment from '../models/Payment'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'
import Stripe from 'stripe'
import UserController from './UserController'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
})

class PaymentController {
    static async createPaymentIntent(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { amount } = req.body
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'eur',
            })
            const payment = await Payment.create({
                amount: paymentIntent.amount,
                status: paymentIntent.status,
                stripe_payment_intent_id: paymentIntent.id,
            })
            res.status(200).json({
                ...payment.toJSON(),
                stripe_payment_intent_id: paymentIntent.id,
            })
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async confirmPayment(req: Request, res: Response): Promise<void> {
        try {
            const { stripe_payment_intent_id, payment_method } = req.body
            const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
                stripe_payment_intent_id,
                { payment_method: payment_method }
            )
            await Payment.update(
                { status: confirmedPaymentIntent.status },
                { where: { stripe_payment_intent_id } }
            )
            if (confirmedPaymentIntent.status === 'succeeded') {
                await UserController.grantPremium(req, res)
            } else {
                res.status(400).send('Payment not successful.')
            }
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default PaymentController

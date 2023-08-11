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

    static async confirmPaymentReactNative(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { stripe_payment_intent_id } = req.body

            // Retrieve the payment intent to check its status
            const paymentIntent = await stripe.paymentIntents.retrieve(
                stripe_payment_intent_id
            )

            // Update the payment status in your database
            await Payment.update(
                { status: paymentIntent.status },
                { where: { stripe_payment_intent_id } }
            )

            // If the payment succeeded, grant the premium access
            if (paymentIntent.status === 'succeeded') {
                await UserController.grantPremium(req, res)
            } else {
                res.status(400).send('Payment not successful.')
            }
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async createPaymentIntentReactNative(
        req: Request,
        res: Response
    ): Promise<void> {
        // Use an existing Customer ID if this is a returning customer.
        const customer = await stripe.customers.create()
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2022-11-15' }
        )
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500,
            currency: 'eur',
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
        })

        res.json({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: `${process.env.STRIPE_SECRET_KEY}`,
        })
    }
}

export default PaymentController

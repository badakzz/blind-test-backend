import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User'
import {
    createDTOOmittingPassword,
    isEmailValid,
    isPasswordValid,
} from '../../http-server/utils/helpers'
import axios from 'axios'
import { sanitizeInput } from '../utils/sanitize'

class AuthController {
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const sanitizedQuery = sanitizeInput(req.body)
            const { email, password, captchaValue } = sanitizedQuery

            const token = req.cookies[process.env.JWT_COOKIE_NAME]
            let decodedToken = null

            if (token) {
                decodedToken = jwt.verify(
                    token,
                    process.env.JWT_SECRET_KEY as string
                ) as any
            }

            if (!decodedToken?.bypassCaptcha) {
                if (!captchaValue) {
                    res.status(401).json({
                        error: 'Captcha verification failed',
                    })
                    return
                }

                const googleVerificationURL = process.env.GOOGLE_RECAPTCHA_URL
                const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET

                const response = await axios.post(googleVerificationURL, null, {
                    params: {
                        secret: secretKey,
                        response: captchaValue,
                    },
                })

                if (!response.data.success) {
                    res.status(401).json({
                        error: 'Captcha verification failed',
                    })
                    return
                }
            }

            const user = await User.findOne({ where: { email } })
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' })
                return
            }

            const passwordMatch = await bcrypt.compare(password, user.password)
            if (!passwordMatch) {
                res.status(401).json({ error: 'Invalid credentials' })
                return
            }

            const newToken = jwt.sign(
                { userId: user.user_id },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '7d' }
            )

            const userDTO = createDTOOmittingPassword(user)

            res.cookie(process.env.JWT_COOKIE_NAME, newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite:
                    process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })

            res.json({ user: userDTO })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async loginNative(req: Request, res: Response): Promise<void> {
        const sanitizedQuery = sanitizeInput(req.body)
        const { email, password } = sanitizedQuery

        try {
            const user = await User.findOne({ where: { email } })
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' })
                return
            }

            const passwordMatch = await bcrypt.compare(password, user.password)
            if (!passwordMatch) {
                res.status(401).json({ error: 'Invalid credentials' })
                return
            }

            const token = jwt.sign(
                { userId: user.user_id },
                process.env.JWT_SECRET_KEY as string
            )
            const userDTO = createDTOOmittingPassword(user)

            res.json({ user: userDTO, token })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async signup(req: Request, res: Response): Promise<void> {
        try {
            const sanitizedQuery = sanitizeInput(req.body)
            const { username, email, password, captchaValue } = sanitizedQuery

            if (!captchaValue) {
                res.status(401).json({ error: 'Captcha verification failed' })
                return
            }

            const googleVerificationURL = process.env.GOOGLE_RECAPTCHA_URL
            const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET

            const response = await axios.post(googleVerificationURL, null, {
                params: {
                    secret: secretKey,
                    response: captchaValue,
                },
            })

            if (!response.data.success) {
                res.status(401).json({ error: 'Captcha verification failed' })
                return
            }

            if (!isEmailValid(email)) {
                res.status(400).json({ error: 'Email format is invalid' })
                return
            }

            if (!isPasswordValid(password)) {
                res.status(400).json({
                    error: 'Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 12 characters long.',
                })
                return
            }

            const existingUser = await User.findOne({ where: { email } })
            if (existingUser) {
                res.status(409).json({ error: 'Email already exists' })
                return
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await User.create({
                username,
                email,
                password: hashedPassword,
                permissions: 1,
                is_active: true,
            })

            const token = jwt.sign(
                {
                    userId: newUser.user_id,
                    bypassCaptcha: true,
                },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '7d' }
            )

            const userDTO = createDTOOmittingPassword(newUser)

            res.cookie(process.env.JWT_COOKIE_NAME, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite:
                    process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })
            res.status(201).json({ user: userDTO })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async updateSettings(req: Request, res: Response): Promise<void> {
        const sanitizedQuery = sanitizeInput(req.body)
        const { email, password, userId } = sanitizedQuery

        try {
            if (!isEmailValid(email)) {
                res.status(400).json({ error: 'Email format is invalid' })
                return
            }

            if (!isPasswordValid(password)) {
                res.status(400).json({
                    error: 'Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 12 characters long.',
                })
                return
            }

            const user = await User.findByPk(userId)
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return
            }

            if (email) user.email = email
            if (password) user.password = await bcrypt.hash(password, 10)

            await user.save()

            res.status(200).json({ success: true })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }
}

export default AuthController

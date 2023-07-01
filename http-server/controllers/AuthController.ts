import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User'
import { createDTOOmittingPassword } from '../../http-server/utils/helpers'
import BlacklistedToken from '../models/BlacklistedToken'

class AuthController {
    static async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body

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
            console.log('Server response:', { token, user: userDTO })

            res.json({ token, user: userDTO })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async signup(req: Request, res: Response): Promise<void> {
        const {
            user_name,
            email,
            password,
        }: { user_name: string; email: string; password: string } = req.body
        try {
            // Check if the email is already registered
            const existingUser = await User.findOne({ where: { email } })
            if (existingUser) {
                res.status(409).json({ error: 'Email already exists' })
                return
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = await User.create({
                user_name,
                email,
                password: hashedPassword,
                permissions: 1,
                is_active: true,
            })

            const token = jwt.sign(
                { userId: newUser.user_id },
                process.env.SECRET_KEY as string
            )

            const userDTO = createDTOOmittingPassword(newUser)

            res.json({ token, userDTO })
            res.status(201).json({ token, user: userDTO })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        const authHeader = req.headers['authorization']

        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            res.status(401).json({ error: 'You must be logged in to logout' })
            return Promise.resolve()
        }

        try {
            const expiry = new Date()
            expiry.setHours(expiry.getHours() + 1)
            await BlacklistedToken.create({
                token: token,
                expiry: expiry,
            })

            res.status(200).json({ message: 'Logout successful' })
        } catch (error: any) {
            console.log('Error when blacklisting token:', error.message)
            res.status(500).json({ error: 'Error occurred while logging out' })
        }

        return Promise.resolve()
    }

    static async checkAuthentication(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1] // Token is expected in the format: Bearer <token>

            if (!token) {
                return res
                    .status(403)
                    .json({ error: 'No token provided' }) as any
            }

            jwt.verify(
                token,
                process.env.SECRET_KEY as string,
                async (err, decoded) => {
                    if (err) {
                        return res.status(401).json({ error: 'Invalid token' })
                    } else {
                        const userId = (decoded as any).userId
                        const user = await User.findOne({
                            where: { user_id: userId },
                        })

                        if (!user) {
                            return res
                                .status(404)
                                .json({ error: 'User not found' })
                        }

                        const userDTO = createDTOOmittingPassword(user)
                        res.status(200).json({ user: userDTO, token })
                    }
                }
            )
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }
}

export default AuthController

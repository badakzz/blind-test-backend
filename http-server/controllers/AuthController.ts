import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User'
import { createDTOOmittingPassword } from '../../http-server/utils/helpers'

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
            username,
            email,
            password,
        }: { username: string; email: string; password: string } = req.body
        try {
            // Check if the email is already registered
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
                { userId: newUser.user_id },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '7d' }
            )
            const userDTO = createDTOOmittingPassword(newUser)

            res.status(201).json({ token, user: userDTO })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async updateSettings(req: Request, res: Response): Promise<void> {
        const userId = req.body.userId
        const { email, password } = req.body

        try {
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

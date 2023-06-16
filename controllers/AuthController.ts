import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User'

class AuthController {
    static async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body

        try {
            // Find the user by email
            const user = await User.findOne({ where: { email } })
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' })
                return
            }

            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, user.password)
            if (!passwordMatch) {
                res.status(401).json({ error: 'Invalid credentials' })
                return
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.user_id },
                process.env.SECRET_KEY as string
            )

            // Return the token and user details
            res.json({ token, user })
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

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create a new user
            const newUser = await User.create({
                user_name,
                email,
                password: hashedPassword,
                permissions: 1,
                is_active: true,
            })

            // Generate JWT token
            const token = jwt.sign({ userId: newUser.user_id }, SECRET_KEY)

            // Return the token and user details
            res.status(201).json({ token, user: newUser })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }
}

export default AuthController

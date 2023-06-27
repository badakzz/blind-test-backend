import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User'
import { createDTOOmittingPassword } from '../utils/helpers'

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

            // Set the token as an HTTP-only cookie
            // check usage
            // res.cookie(process.env.JWT_COOKIE_NAME, token, { httpOnly: true })

            // Return the token and user details
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
            const token = jwt.sign(
                { userId: newUser.user_id },
                process.env.SECRET_KEY as string
            )

            // Return the token and user details
            const userDTO = createDTOOmittingPassword(newUser)

            res.json({ token, userDTO })
            res.status(201).json({ token, user: userDTO })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        // Return a success message
        res.status(200).json({ message: 'Logout successful' })
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

            // Verify the token
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

                        // We can send back some user details (without sensitive info) if required.
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

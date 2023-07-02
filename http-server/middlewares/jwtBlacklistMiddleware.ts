import { Request, Response, NextFunction } from 'express'
import { Op } from 'sequelize'
import BlacklistedToken from '../models/BlacklistedToken'

export const checkJwtBlacklist = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract the JWT from the Authorization header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Authorization: Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'You must be logged in for that' })
    }

    try {
        const blacklistedToken = await BlacklistedToken.findOne({
            where: {
                token: token,
                expiry: {
                    [Op.gt]: new Date(), // Op.gt equals >
                },
            },
        })

        if (blacklistedToken) {
            return res.status(403).json({
                error: 'This token is blacklisted',
            })
        }

        next()
    } catch (error) {
        console.error('Error querying blacklisted tokens:', error)
        res.status(500).send('Server error')
    }
}

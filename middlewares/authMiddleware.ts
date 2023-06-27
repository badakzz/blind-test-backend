import { Request, Response, NextFunction } from 'express'

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract the JWT from the Authorization header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Authorization: Bearer <token>

    if (token) {
        // JWT exists, continue to the next middleware
        next()
    } else {
        // JWT is not provided, return an error
        res.status(401).json({ error: 'You must be logged in for that' })
    }
}

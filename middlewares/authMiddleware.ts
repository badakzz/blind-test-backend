import { Request, Response, NextFunction } from 'express'

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Authorization: Bearer <token>
    console.log('Executing middleware: requireAuth')

    if (token) {
        next()
    } else {
        res.status(401).json({ error: 'You must be logged in for that' })
    }
}

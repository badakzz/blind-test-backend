import { Request, Response, NextFunction } from 'express'
import { Session } from 'express-session'

interface CustomSession extends Session {
    token: string
}

// Middleware to protect routes that require authentication
export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const session = req.session as CustomSession
    if (session && session.token) {
        // Session is valid, continue to the next middleware
        next()
    } else {
        // Session is not valid, redirect to the login page
        res.redirect('/login')
    }
}

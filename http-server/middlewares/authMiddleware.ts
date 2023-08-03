import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
interface AuthRequest extends Request {
    userId?: string
}

export const requireAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1]
    console.log('auth middleware triggered')
    if (
        req.path === '/api/auth/signup' ||
        req.path === '/api/auth/login' ||
        req.path === '/api/auth/csrf'
    ) {
        next()
        return
    }
    if (token) {
        console.log('verifying token from server')
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            (err: any, decoded: any) => {
                if (err) {
                    console.log('error on jwt validation', err)
                    return res.status(401).json({ error: 'Invalid token' })
                } else {
                    req.userId = decoded.userId
                    next()
                }
            }
        )
    } else {
        res.status(401).json({ error: 'Missing token' })
    }
}

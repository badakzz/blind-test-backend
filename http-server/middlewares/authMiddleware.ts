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
    console.log('requireAuth triggered')
    let token = req.cookies[process.env.JWT_COOKIE_NAME]
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ')
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1]
        }
    }

    console.log('received token', token)
    if (
        req.path === '/api/auth/signup' ||
        req.path === '/api/auth/login' ||
        req.path === '/api/auth/csrf'
    ) {
        next()
        return
    }

    if (token) {
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            (err: any, decoded: any) => {
                if (err) {
                    console.log('Error on jwt validation', err)
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

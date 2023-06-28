import { Request, Response, NextFunction } from 'express'
import { doubleCsrf } from 'csrf-csrf'

export const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
    doubleCsrf({
        //@ts-ignore
        getSecret: (req) => req.secret,
        cookieName: process.env.CSRF_COOKIE_NAME,
        cookieOptions: { sameSite: true, signed: true },
        // secure: process.env.NODE_ENV === 'production' uncomment for production
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getTokenFromRequest: (req) => req.headers['x-csrf-token'],
    })

const CSRFController = {
    getCSRF: (req, res) => {
        const csrfToken = generateToken(res, req)
        res.cookie(process.env.CSRF_COOKIE_NAME, csrfToken, {
            sameSite: true,
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production'
        })
    },
}

export const withCsrf = (req: Request, res: Response, next: NextFunction) => {
    doubleCsrfProtection(req, res, (error) => {
        if (error === invalidCsrfTokenError) {
            res.status(403).json({ error: 'CSRF validation error' })
        } else {
            next()
        }
    })
}

export default CSRFController

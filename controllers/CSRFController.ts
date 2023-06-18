import { Request, Response, NextFunction } from 'express'
import { doubleCsrf } from 'csrf-csrf'

export const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
    doubleCsrf({
        //@ts-ignore
        getSecret: (req) => req.secret,
        cookieName: process.env.CSRF_COOKIE_NAME,
        cookieOptions: { sameSite: true, secure: true, signed: true },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getTokenFromRequest: (req) => req.headers['x-csrf-token'],
    })

const CSRFController = {
    getCSRF: (req, res) => {
        const csrfToken = generateToken(res, req)
        res.json({ csrfToken })
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

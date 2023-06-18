import { Request, Response, NextFunction } from 'express'
import {
    doubleCsrfProtection,
    invalidCsrfTokenError,
} from '../controllers/CSRFController'

export const withCsrf = (req: Request, res: Response, next: NextFunction) => {
    doubleCsrfProtection(req, res, (error) => {
        if (error === invalidCsrfTokenError) {
            res.status(403).json({ error: 'CSRF validation error' })
        } else {
            next()
        }
    })
}

export default withCsrf

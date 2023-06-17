import csrf from 'csurf'
import { Request, Response, NextFunction } from 'express'

interface CustomRequest extends Request {
    csrfToken(): string
}

const csrfProtection = csrf({ cookie: true })

const CSRFController = {
    getCSRF: (req: CustomRequest, res: Response, next: NextFunction) => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true })
        res.json({ csrfToken: req.csrfToken() })
    },

    verifyCSRF: (req: CustomRequest, res: Response, next: NextFunction) => {
        csrfProtection(req, res, next)
    },
}

export default CSRFController

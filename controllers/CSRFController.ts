import csrf from 'csurf'
import { Request, Response, NextFunction } from 'express'

const csrfProtection = csrf({ cookie: true })

const CSRFController = {
    getCSRF: (req: Request, res: Response, next: NextFunction) => {
        // res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true })
        // res.json({ csrfToken: req.csrfToken() })
    },

    verifyCSRF: (req: Request, res: Response, next: NextFunction) => {
        csrfProtection(req, res, next)
    },
}

export default CSRFController

import { Request, Response, NextFunction } from 'express'
import { withCsrf } from '../controllers/CSRFController'
import csrf from 'csurf'

// export const requireCsrf = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     withCsrf(req, res, next)
// }

const csrfProtection = csrf({
    cookie: {
        key: process.env.CSRF_COOKIE_NAME,
        sameSite: 'none',
        httpOnly: true,
        signed: true,
        // secure: process.env.NODE_ENV === 'production'
    },
})

import { Router } from 'express'
import CSRFController from '../controllers/CSRFController'

const router = Router()

router.get('/api/auth/csrf', csrfProtection, (req, res) => {
    //@ts-ignore
    const csrfToken = req.csrfToken()
    console.log('CSRF token from server:', csrfToken)
    res.status(200).send({ csrfToken })
})

export default router

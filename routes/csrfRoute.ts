import { Request, Response, NextFunction } from 'express'
import { withCsrf } from '../controllers/CSRFController'
import csrf from 'csurf'
import { Router } from 'express'

const csrfProtection = csrf({
    cookie: {
        key: process.env.COOKIE_PARSER_SECRET,
        sameSite: 'lax',
        httpOnly: true,
        signed: false,
        // secure: process.env.NODE_ENV === 'production'
    },
})

const router = Router()

router.get('/api/auth/csrf', csrfProtection, (req, res) => {
    //@ts-ignore
    const csrfToken = req.csrfToken()
    console.log('CSRF token from server:', csrfToken)
    res.status(200).send({ csrfToken })
})

export default router

import { requireCsrf } from '../middlewares/csrfMiddleware'
import csrf from 'csurf'
import { Router } from 'express'

// const csrfProtection = csrf({
//     cookie: {
//         key: process.env.COOKIE_PARSER_SECRET,
//         sameSite: 'lax', // this and
//         httpOnly: true, // this config need to stay or client wont be able to validate token
//         signed: false,
//         // secure: process.env.NODE_ENV === 'production'
//     },
// })

const router = Router()

router.get('/api/auth/csrf', requireCsrf, (req, res) => {
    //@ts-ignore
    const csrfToken = req.csrfToken()
    console.log('CSRF token from server:', csrfToken)
    res.status(200).send({ csrfToken })
})

export default router

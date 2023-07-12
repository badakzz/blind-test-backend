import { requireCsrf } from '../middlewares/csrfMiddleware'
import { Router } from 'express'

const router = Router()

router.get('/api/auth/csrf', requireCsrf, (req, res) => {
    //@ts-ignore
    const csrfToken = req.csrfToken()
    console.log('CSRF token from server:', csrfToken)
    res.status(200).send({ csrfToken })
})

export default router

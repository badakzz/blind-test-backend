import express from 'express'
import { Request, Response, NextFunction } from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'

const csrfProtection = csrf({
    cookie: {
        key: process.env.CSRF_COOKIE_NAME,
        sameSite: 'none',
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === 'production',
    },
})

const CSRFController = {
    getCSRF: (req, res) => {
        const csrfToken = req.csrfToken()
        console.log(`Generated CSRF token: ${csrfToken}`)
        res.cookie(process.env.CSRF_COOKIE_NAME, csrfToken, {
            sameSite: 'none',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        res.status(200).send()
    },
}

export const withCsrf = csrfProtection

export default CSRFController

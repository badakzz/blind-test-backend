import request from 'supertest'
import express from 'express'
import csrfRoute from '../http-server/routes/csrfRoute'
import userRoutes from '../http-server/routes/userRoutes'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import AuthController from '../http-server/controllers/AuthController'
import { parse } from 'cookie' // Make sure to import the cookie library

export const generateCsrfToken = (req, res, next) => {
    const csrfToken = Math.random().toString(36).substr(2)
    res.cookie('csrfToken', csrfToken)
    // console.log('Response object after setting CSRF token:', res)
    next()
}

export const validateCsrfToken = (req, res, next) => {
    // console.log('All cookies:', req.cookies)
    const csrfTokenFromHeader = req.headers['x-csrf-token']
    console.log('Request headers:', req.headers)

    const cookies = parse(req.headers.cookie || '')
    const csrfTokenFromCookie = cookies.csrfToken
    console.log('Manually parsed CSRF from cookies', csrfTokenFromCookie)
    if (csrfTokenFromHeader && csrfTokenFromHeader === csrfTokenFromCookie) {
        next()
    } else {
        res.status(403).send('Invalid CSRF token')
    }
}

describe('Auth Signup Route', () => {
    let app: express.Express
    let csrfToken: string | null = null
    let csrfCookie: string | null = null

    beforeEach(async () => {
        app = express()
        app.use(
            cors({
                origin: [
                    'http://localhost:3000',
                    'http://localhost:19006',
                    'exp://192.168.1.214:8081',
                    '192.168.1.214',
                ],
                credentials: true,
                allowedHeaders: ['Content-Type', 'x-csrf-token'], // Add this line
            })
        )
        app.use(express.json())
        app.use((req, res, next) => {
            console.log('Processing request in middleware:', req.originalUrl)
            next()
        })
        app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
        app.use(generateCsrfToken)
        app.get('/api/auth/csrf', generateCsrfToken, (req, res) => {
            res.status(200).send({ message: 'CSRF token generated' })
        })
        app.post('/api/auth/signup', validateCsrfToken, AuthController.signup)

        const csrfResponse = await request(app).get('/api/auth/csrf')
        csrfCookie = csrfResponse.headers['set-cookie'].join(';')
        const cookiesString = csrfResponse.headers['set-cookie']
        console.log('Response headers:', csrfResponse.headers)
        console.log('Cookies from CSRF endpoint:', cookiesString)
        const csrfTokenCookie = cookiesString.find((cookie) =>
            cookie.startsWith('csrfToken')
        )
        csrfToken = csrfTokenCookie?.split(';')[0].split('=')[1]
        console.log('csrf', csrfToken)
        console.log('secret', process.env.COOKIE_PARSER_SECRET)
    })

    it('should successfully create a user on POST /api/auth/signup', async () => {
        const newUser = {
            username: 'test',
            email: 'test@example.com',
            password: 'ValidPassword123!',
        }

        const response = await request(app)
            .post('/api/auth/signup')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie) // Setting the cookies here
            .send(newUser)

        expect(response.status).toBe(201)
        expect(response.body.user.username).toBe(newUser.username)
        expect(response.body.user.email).toBe(newUser.email)
        expect(response.body.user.permissions).toBe(1)
        expect(response.body.user.is_active).toBe(true)
    })

    // it('should fail when email is already registered on POST /api/auth/signup', async () => {
    //     const existingUser = {
    //         username: 'existing',
    //         email: 'existing@example.com',
    //         password: 'ValidPassword123!',
    //     }

    //     const response = await request(app)
    //         .post('/api/auth/signup')
    //         .set('x-csrf-token', csrfToken)
    //         .send(existingUser)

    //     expect(response.status).toBe(409)
    //     expect(response.body.error).toBe('Email already exists')
    // })

    // You can add more tests for invalid email, invalid password, etc.
})

import request from 'supertest'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import AuthController from '../http-server/controllers/AuthController'
import { parse } from 'cookie'
import UserController from '../http-server/controllers/UserController'

export const generateCsrfToken = (req, res, next) => {
    const csrfToken = Math.random().toString(36).substr(2)
    res.cookie('csrfToken', csrfToken)
    next()
}

export const validateCsrfToken = (req, res, next) => {
    const csrfTokenFromHeader = req.headers['x-csrf-token']
    const cookies = parse(req.headers.cookie || '')
    const csrfTokenFromCookie = cookies.csrfToken
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
        app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
        app.use(generateCsrfToken)
        app.get('/api/auth/csrf', generateCsrfToken, (req, res) => {
            res.status(200).send({ message: 'CSRF token generated' })
        })
        app.post('/api/auth/signup', validateCsrfToken, AuthController.signup)
        app.post('/api/auth/login', validateCsrfToken, AuthController.login)

        const csrfResponse = await request(app).get('/api/auth/csrf')
        csrfCookie = csrfResponse.headers['set-cookie'].join(';')
        const cookiesString = csrfResponse.headers['set-cookie']
        const csrfTokenCookie = cookiesString.find((cookie) =>
            cookie.startsWith('csrfToken')
        )
        csrfToken = csrfTokenCookie?.split(';')[0].split('=')[1]
    })

    afterAll(async () => {
        const signupUser = await UserController.getUserByEmail(
            'test2@example.com'
        )
        if (signupUser) {
            await UserController.deleteUser('test2@example.com')
        }
    })

    it('should successfully create a user on POST /api/auth/signup', async () => {
        const newUser = {
            username: 'test',
            email: 'test2@example.com',
            password: 'ValidPassword123!',
        }

        const response = await request(app)
            .post('/api/auth/signup')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(newUser)

        expect(response.status).toBe(201)
        expect(response.body.user.username).toBe(newUser.username)
        expect(response.body.user.email).toBe(newUser.email)
        expect(response.body.user.permissions).toBe(1)
        expect(response.body.user.is_active).toBe(true)
    })

    it('should fail when email is already registered on POST /api/auth/signup', async () => {
        const existingUser = {
            username: 'existing',
            email: 'test2@example.com',
            password: 'ValidPassword123!',
        }

        const response = await request(app)
            .post('/api/auth/signup')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(existingUser)

        expect(response.status).toBe(409)
        expect(response.body.error).toBe('Email already exists')
    })

    it('should fail when email format is invalid on POST /api/auth/signup', async () => {
        const invalidEmailUser = {
            username: 'invalidEmail',
            email: 'invalid-email',
            password: 'ValidPassword123!',
        }

        const response = await request(app)
            .post('/api/auth/signup')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(invalidEmailUser)

        expect(response.status).toBe(400)
        expect(response.body.error).toBe('Email format is invalid')
    })

    it('should fail when password format is invalid on POST /api/auth/signup', async () => {
        const invalidPasswordUser = {
            username: 'invalidPassword',
            email: 'invalidpassword@example.com',
            password: 'invalidpassword',
        }

        const response = await request(app)
            .post('/api/auth/signup')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(invalidPasswordUser)

        expect(response.status).toBe(400)
        expect(response.body.error).toBe(
            'Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 12 characters long.'
        )
    })

    it('should successfully login a user with right password on POST /api/auth/login', async () => {
        const newUser = {
            email: 'test2@example.com',
            password: 'ValidPassword123!',
        }

        const response = await request(app)
            .post('/api/auth/login')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(newUser)

        expect(response.status).toBe(200)
        expect(response.body.user.email).toBe(newUser.email)
        expect(response.body.user.permissions).toBe(1)
        expect(response.body.user.is_active).toBe(true)
    })

    it('should fail when trying to login a user with wrong password on POST /api/auth/login', async () => {
        const newUser = {
            email: 'test2@example.com',
            password: 'wrongpassword',
        }

        const response = await request(app)
            .post('/api/auth/login')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(newUser)

        expect(response.status).toBe(401)
    })
})

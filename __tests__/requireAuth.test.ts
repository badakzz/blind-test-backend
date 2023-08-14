import { requireAuth } from './../http-server/middlewares/authMiddleware'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import AuthController from '../http-server/controllers/AuthController'
import { parse } from 'cookie'
import UserController from '../http-server/controllers/UserController'
import ChatroomController from '../http-server/controllers/ChatroomController'

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
        app.post('/api/auth/login', validateCsrfToken, AuthController.login)
        app.post(
            '/api/v1/chatrooms',
            validateCsrfToken,
            requireAuth,
            ChatroomController.createChatroom
        )

        const csrfResponse = await request(app).get('/api/auth/csrf')
        csrfCookie = csrfResponse.headers['set-cookie'].join(';')
        const cookiesString = csrfResponse.headers['set-cookie']
        const csrfTokenCookie = cookiesString.find((cookie) =>
            cookie.startsWith('csrfToken')
        )
        csrfToken = csrfTokenCookie?.split(';')[0].split('=')[1]
    })

    it('should successfully create a chatroom if given a right jwt token', async () => {
        const newUser = {
            email: 'test@test.com',
            password: 'Validpassword123!',
        }

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', csrfCookie)
            .send(newUser)

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.body.user.email).toBe(newUser.email)
        expect(loginResponse.body.user.permissions).toBe(1)
        expect(loginResponse.body.user.is_active).toBe(true)

        const jwtCookie = loginResponse.headers['set-cookie'].join(';')

        const chatroomResponse = await request(app)
            .post('/api/v1/chatrooms')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', `${csrfCookie}; ${jwtCookie}`)
            .send({})

        expect(chatroomResponse.status).toBe(201)
        expect(chatroomResponse.body.chatroom_id).toBeDefined()
    })

    it('should fail when creating a chatroom with wrong jwt token', async () => {
        const jwtCookie =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI3LCJpYXQiOjE2OTIwNDIwMDN9.Lu-ycZAh5Qnoh-utc9e52sDC5YjA5c3GDCYoATvW51dsa'
        const chatroomResponse = await request(app)
            .post('/api/v1/chatrooms')
            .set('x-csrf-token', csrfToken)
            .set('Cookie', `${csrfCookie}; ${jwtCookie}`)
            .send({})

        expect(chatroomResponse.status).toBe(401)
    })
})

import request from 'supertest'
import express from 'express'
import csrfRoute from '../http-server/routes/csrfRoute'
import cors from 'cors'
import cookieParser from 'cookie-parser'

describe('CSRF Route', () => {
    let app: express.Express

    beforeEach(() => {
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
            })
        )
        app.use(express.json())
        app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
        app.use(csrfRoute)
    })

    it('should set a CSRF token on GET /api/auth/csrf', async () => {
        const response = await request(app).get('/api/auth/csrf')

        expect(response.status).toBe(200)

        expect(response.headers['set-cookie']).toBeDefined()

        const tokenValue = response.body.csrfToken

        expect(tokenValue).toBeDefined()
        expect(typeof tokenValue).toBe('string')
        expect(tokenValue.length).toBe(36)
    })
})

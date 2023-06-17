import { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import session from 'express-session'
import userRoutes from './routes/userRoutes'
import chatroomRoutes from './routes/chatroomRoutes'
import chatMessageRoutes from './routes/chatMessageRoutes'
import scoreboardRoutes from './routes/scoreboardRoutes'

interface AuthRequest extends Request {
    userId?: string
}

const app = express()

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
)
app.use(express.json())
app.use(
    session({
        secret: process.env.SECRET_KEY as string,
        resave: false,
        saveUninitialized: false,
    })
)
// Middleware for verifying JWT tokens
app.use((req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (
        req.path === '/api/auth/signup' ||
        req.path === '/api/auth/login' ||
        req.path === '/api/auth/csrf'
    ) {
        next()
        return
    }
    if (token) {
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            (err: any, decoded: any) => {
                if (err) {
                    return res.status(401).json({ error: 'Invalid token' })
                } else {
                    req.userId = decoded.userId
                    next()
                }
            }
        )
    } else {
        res.status(401).json({ error: 'Missing token' })
    }
})

app.use(chatroomRoutes)
app.use(chatMessageRoutes)
app.use(userRoutes)
app.use(scoreboardRoutes)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// For development only
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1)
})

const PORT = process.env.NODE_SERVER_PORT || 3002
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})

export default app

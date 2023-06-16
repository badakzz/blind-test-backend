import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import chatroomRoutes from './routes/chatroomRoutes'
import chatMessageRoutes from './routes/chatMessageRoutes'
import scoreboardRoutes from './routes/scoreboardRoutes'
import jwt from 'jsonwebtoken'

const app = express()

app.use(cors())
app.use(express.json())

// Middleware for verifying JWT tokens
app.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
        jwt.verify(token, 'your-secret-key', (err: any, decoded: any) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' })
            } else {
                req.userId = (decoded as any).userId
                next()
            }
        })
    } else {
        res.status(401).json({ error: 'Missing token' })
    }
})

app.use(chatroomRoutes)
app.use(chatMessageRoutes)
app.use(userRoutes)
app.use(scoreboardRoutes)

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// for development only
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1)
})

const PORT = process.env.SERVER_PORT || 3002

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})

export default app

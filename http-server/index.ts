import { internalServerErrorHandler } from './utils/ErrorHandlers'
import { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes'
import chatroomRoutes from './routes/chatroomRoutes'
import chatMessageRoutes from './routes/chatMessageRoutes'
import csrfRoute from './routes/csrfRoute'
import guessRoutes from './routes/guessRoutes'
import scoreRoutes from './routes/scoreRoutes'
import songRoutes from './routes/songRoutes'
import playlistRoutes from './routes/playlistRoutes'
import paymentRoutes from './routes/paymentRoutes'
import sequelize from './config/database'

const app = express()

app.use(
    cors({
        // origin: `${process.env.CLIENT_DOMAIN}:${process.env.CLIENT_PORT}`,
        origin: ['http://localhost:3000', 'http://localhost:19006'],
        credentials: true,
    })
)

app.use(express.json())

app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))

app.use(chatroomRoutes)
app.use(chatMessageRoutes)
app.use(userRoutes)
app.use(scoreRoutes)
app.use(guessRoutes)
app.use(songRoutes)
app.use(playlistRoutes)
app.use(paymentRoutes)
app.use(csrfRoute)

// Middleware for verifying JWT tokens

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Error in http-server')
})

app.use(internalServerErrorHandler as any)

const PORT = process.env.NODE_SERVER_PORT || 3002
sequelize
    .sync()
    .then(() => {
        console.log('Database synced successfully.')

        // We only start the server if the database sync is successful
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`)
        })
    })
    .catch((error) => console.error('Failed to sync database:', error))

export default app

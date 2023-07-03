import { internalServerErrorHandler } from './utils/ErrorHandlers'
import { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes'
import chatroomRoutes from './routes/chatroomRoutes'
import chatMessageRoutes from './routes/chatMessageRoutes'
import csrfRoute from './routes/csrfRoute'
import guessedSongRoutes from './routes/guessedSongsRoutes'
import scoreboardRoutes from './routes/scoreboardRoutes'
import spotifyRoutes from './routes/spotifyRoutes'

const app = express()

app.use(
    cors({
        // origin: `${process.env.CLIENT_DOMAIN}:${process.env.CLIENT_PORT}`,
        origin: 'http://localhost:3000',
        credentials: true,
    })
)

app.use(express.json())

app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))

app.use(chatroomRoutes)
app.use(chatMessageRoutes)
app.use(userRoutes)
app.use(scoreboardRoutes)
app.use(guessedSongRoutes)
app.use(spotifyRoutes)
app.use(csrfRoute)

// Middleware for verifying JWT tokens

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.use(internalServerErrorHandler as any)

// For development only
// process.on('uncaughtException', (err) => {
//     console.error('There was an uncaught error', err)
//     process.exit(1)
// })

const PORT = process.env.NODE_SERVER_PORT || 3002
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})

export default app

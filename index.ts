import express from 'express'
import * as http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoutes from './http-server/routes/userRoutes'
import chatroomRoutes from './http-server/routes/chatroomRoutes'
import chatMessageRoutes from './http-server/routes/chatMessageRoutes'
import csrfRoute from './http-server/routes/csrfRoute'
import guessRoutes from './http-server/routes/guessRoutes'
import scoreRoutes from './http-server/routes/scoreRoutes'
import songRoutes from './http-server/routes/songRoutes'
import playlistRoutes from './http-server/routes/playlistRoutes'
import paymentRoutes from './http-server/routes/paymentRoutes'
import roadmapTicketRoutes from './http-server/routes/roadmapTicketRoutes'
import ChatMessageController from './http-server/controllers/ChatMessageController'
import ChatroomController from './http-server/controllers/ChatroomController'
import { Request, Response, NextFunction } from 'express'
import ChatMessage from './http-server/models/ChatMessage'
import { internalServerErrorHandler } from './http-server/utils/ErrorHandlers'
import sequelize from './http-server/config/database'
import GuessController from './http-server/controllers/GuessController'
import ScoreController from './http-server/controllers/ScoreController'

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://localhost:19006',
            'exp://192.168.1.214:8081',
        ],
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
})

const connectedUsers: { id: string; username: string; chatroomId: string }[] =
    []
const chatrooms = []
const chatroomSongsIndex = {}

io.on('connection', async (socket) => {
    console.log(`User connected with ID: ${socket.id}`)

    socket.on('createRoom', (username, chatroomId) => {
        socket.join(chatroomId)
        connectedUsers.push({ id: socket.id, username, chatroomId })
        io.to(chatroomId).emit(
            'connectedUsers',
            connectedUsers.filter((user) => user.chatroomId === chatroomId)
        )
        chatrooms.push(chatroomId)
        console.log(
            `User ${username} created and joined chatroom ${chatroomId}`
        )
    })

    socket.on('joinRoom', (username, chatroomId) => {
        const chatroom = chatrooms.find((c) => c === chatroomId)
        if (chatroom) {
            connectedUsers.push({ id: socket.id, username, chatroomId })

            socket.join(chatroomId)

            io.to(chatroomId).emit('userConnected', username)
            io.to(chatroomId).emit(
                'connectedUsers',
                connectedUsers.filter((user) => user.chatroomId === chatroomId)
            )
            console.log(`User ${username} joined chatroom ${chatroom}`)
        } else {
            console.log(`Chatroom with ID: ${chatroomId} not found.`)
        }
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected with ID: ${socket.id}`)
        const index = connectedUsers.findIndex((u) => u.id === socket.id)
        if (index !== -1) {
            const user = connectedUsers.splice(index, 1)[0]
            io.emit('userDisconnected', user)
            io.to(user.chatroomId).emit(
                'connectedUsers',
                connectedUsers.filter(
                    (usr) => usr.chatroomId === user.chatroomId
                )
            )
            console.log(`User ${user.username} left the chatroom`)
        }
    })

    socket.on('chatMessage', (message) => {
        console.log(
            `Received message ${message.content} from ${message.author} in chatroom ${message.chatroomId}`
        )
        ChatMessageController.processChatMessage(
            {
                chatroom_id: message.chatroomId,
                author: message.author,
                content: message.content,
                user_id: message.userId,
            } as ChatMessage,
            message.chatroomId,
            io
        )
        io.to(message.chatroomId).emit('chatMessage', message)
    })

    socket.on('startGame', (gameData) => {
        console.log(
            `Received game data in room ${gameData.chatroomId}: current song ${gameData.firstSong.preview_url}\n tracklist \n ${gameData.trackPreviewList[0]}`
        )
        io.to(gameData.chatroomId).emit('gameStarted', {
            firstSong: gameData.firstSong,
            trackPreviewList: gameData.trackPreviewList,
        })
    })

    socket.on(
        'currentSongPlaying',
        async ({ chatroomId, currentSongPlaying }) => {
            console.log(
                `Setting current song of id ${currentSongPlaying} in chatroom of id ${chatroomId}`
            )

            if (!chatroomSongsIndex[chatroomId]) {
                chatroomSongsIndex[chatroomId] = { lastSong: null, index: 0 }
                console.log(
                    `Initializing chatroomSongsIndex[${chatroomId}] to:`,
                    chatroomSongsIndex[chatroomId]
                )
            }

            console.log(
                `Current chatroomSongsIndex[${chatroomId}] is:`,
                chatroomSongsIndex[chatroomId]
            )

            if (
                currentSongPlaying !== chatroomSongsIndex[chatroomId].lastSong
            ) {
                chatroomSongsIndex[chatroomId].index++
                chatroomSongsIndex[chatroomId].lastSong = currentSongPlaying
                console.log(
                    'current song played',
                    chatroomSongsIndex[chatroomId].index
                )
            } else {
                console.log(
                    'Received the same song again. Not incrementing the index.'
                )
            }

            try {
                if (currentSongPlaying && chatroomId) {
                    const updatedChatroom =
                        await ChatroomController.updateCurrentSong(
                            chatroomId,
                            currentSongPlaying
                        )
                    if (!updatedChatroom) {
                        console.error(
                            `Chatroom with id ${chatroomId} not found`
                        )
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
    )

    socket.on('correctGuess', (guessData) => {
        io.to(guessData.chatroomId).emit('correctGuess', guessData)
    })

    let timeoutId
    socket.on('audioEnded', (chatroomId) => {
        if (chatroomSongsIndex[chatroomId].hasOwnProperty('index'))
            console.log(
                'chatroomSongsIndex[chatroomId]',
                chatroomSongsIndex[chatroomId].index
            )
        if (
            chatroomSongsIndex[chatroomId] &&
            chatroomSongsIndex[chatroomId].index >= 10
        ) {
            console.log('Game is over for chatroom', chatroomId)
            io.to(chatroomId).emit('gameOver')
        } else {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                console.log('Audio ended for chatroom', chatroomId)
                io.to(chatroomId).emit('syncTimeOut')
            }, 5000)
        }
    })

    socket.on('resetGame', ({ chatroomId }) => {
        chatroomSongsIndex[chatroomId] = { lastSong: null, index: 0 }

        GuessController.deleteGuessesByChatroom(chatroomId)
        ScoreController.deleteScoresByChatroom(chatroomId)

        io.to(chatroomId).emit('gameReset')

        console.log(`Game reset in chatroom ${chatroomId}`)
    })
})

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

app.use(chatroomRoutes)
app.use(chatMessageRoutes)
app.use(userRoutes)
app.use(scoreRoutes)
app.use(guessRoutes)
app.use(songRoutes)
app.use(playlistRoutes)
app.use(roadmapTicketRoutes)
app.use(paymentRoutes)

app.use(csrfRoute)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Error in http-server')
})

app.use(internalServerErrorHandler as any)

const PORT = parseInt(process.env.NODE_SERVER_PORT) || 3002

sequelize
    .sync()
    .then(() => {
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}.`)
        })
    })
    .catch((error) => console.error('Failed to sync database:', error))

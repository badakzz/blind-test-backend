import express from 'express'
import * as http from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
})

const PORT = process.env.NODE_WEBSOCKET_PORT || 3001

const connectedUsers: { id: string; username: string; chatroomId: string }[] =
    []

io.on('connection', async (socket) => {
    console.log(`User connected with ID: ${socket.id}`)

    socket.on('createRoom', (user) => {
        socket.join(user.chatroomId)
        connectedUsers.push(user)
        io.to(user.chatroomId).emit('userConnected', user)
        io.to(user.chatroomId).emit('connectedUsers', connectedUsers)
        console.log(
            `User ${user.username} created and joined chatroom ${user.chatroomId}`
        )
    })

    socket.on('joinRoom', (user) => {
        connectedUsers.push(user)
        socket.join(user.chatroomId)
        console.log(
            `User ${user.username} joined the chatroom with ID: ${user.chatroomId}`
        )
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected with ID: ${socket.id}`)
        const index = connectedUsers.findIndex((u) => u.id === socket.id)
        if (index !== -1) {
            const user = connectedUsers.splice(index, 1)[0]
            io.emit('userDisconnected', user)
            io.emit('connectedUsers', connectedUsers)
            console.log(`User ${user.username} left the chatroom`)
        }
    })

    socket.on('chatMessage', (message) => {
        io.to(message.chatroomId).emit('chatMessage', message)
    })

    socket.on('startGame', (gameData) => {
        io.to(gameData.chatroomId).emit('gameStarted', gameData.trackPreviews)
    })

    socket.on('correctGuess', (guessData) => {
        io.to(guessData.chatroomId).emit('correctGuess', guessData)
    })

    socket.on('gameOver', (gameData) => {
        io.to(gameData.chatroomId).emit('gameOver', gameData)
    })
})

httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

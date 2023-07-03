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
const chatrooms = []

console.log('userArray', connectedUsers)

io.on('connection', async (socket) => {
    console.log(`User connected with ID: ${socket.id}`)

    socket.on('createRoom', (username, chatroomId) => {
        socket.join(chatroomId)
        connectedUsers.push(username)
        io.to(chatroomId).emit('userConnected', username)
        io.to(chatroomId).emit('connectedUsers', connectedUsers)
        chatrooms.push(chatroomId)
        console.log(
            `User ${username} created and joined chatroom ${chatroomId}`
        )
    })

    socket.on('joinRoom', (username, chatroomId) => {
        connectedUsers.push(username)
        const chatroom = chatrooms.find((c) => c === chatroomId)
        if (chatroom) {
            io.to(chatroomId).emit('userConnected', username)
            io.to(chatroomId).emit('connectedUsers', connectedUsers)
            console.log(
                `User ${username} created and joined chatroom ${chatroom.chatroomId}`
            )
        } else {
            console.log(`Chatroom with ID: ${chatroomId} not found.`)
        }
        socket.join(chatroomId)
        console.log(
            `User ${username} joined the chatroom with ID: ${chatroomId}`
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
        console.log(
            `Received message ${message.message} from ${message.author} in chatroom ${message.chatroomId})`
        )
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

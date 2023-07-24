import express from 'express'
import * as http from 'http'
import { Server } from 'socket.io'
import ChatMessage from '../http-server/models/ChatMessage'
import ChatMessageController from '../http-server/controllers/ChatMessageController'
import ChatroomController from '../http-server/controllers/ChatroomController'

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
const chatMessageServices = {}

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
        // chatMessageServices[chatroomId] = new ChatMessageService(chatroomId, io)
    })

    socket.on('joinRoom', (username, chatroomId) => {
        const chatroom = chatrooms.find((c) => c === chatroomId)
        if (chatroom) {
            // Add the user to the connectedUsers array here
            connectedUsers.push({ id: socket.id, username, chatroomId })

            // Join the user to the chatroom
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

    // socket.on("chatMessage", (message) => {
    //     console.log(
    //         `Received message ${message.content} from ${message.author} in chatroom ${message.chatroomId}`
    //     )
    //     io.to(message.chatroomId).emit("chatMessage", message)

    //     const fakeRequest = httpMocks.createRequest({
    //         method: "POST",
    //         url: "/chatMessage",
    //         body: {
    //             chatroom_id: message.chatroomId,
    //             author: message.author,
    //             content: message.content,
    //             user_id: message.userId,
    //             io: io,
    //         },
    //     })

    //     const fakeResponse = httpMocks.createResponse()

    //     fakeResponse.on("end", function () {
    //         if (
    //             fakeResponse._getStatusCode() >= 200 &&
    //             fakeResponse._getStatusCode() < 300
    //         ) {
    //             io.to(fakeRequest.body.chatroom_id).emit(
    //                 "chatMessage",
    //                 fakeResponse._getData()
    //             )
    //         } else {
    //             console.error(fakeResponse._getData())
    //         }
    //     })

    //     ChatMessageController.processChatMessage(fakeRequest, fakeResponse)
    // })

    socket.on('startGame', (gameData) => {
        console.log(
            `Received game data in room ${gameData.chatroomId}: current song ${gameData.currentSong.preview_url}\n tracklist \n ${gameData.trackPreviewList[0]}`
        )
        io.to(gameData.chatroomId).emit('gameStarted', {
            currentSong: gameData.currentSong, // Send the whole song object, not just the ID
            trackPreviewList: gameData.trackPreviewList,
        })
    })

    socket.on(
        'currentSongPlaying',
        async ({ chatroomId, currentSongPlaying }) => {
            console.log(
                `Setting current song of id ${currentSongPlaying} in chatroom of id ${chatroomId}`
            )
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
                        // handle error, e.g. send error message back to client
                    }
                }
            } catch (error) {
                console.error(error)
                // handle error, e.g. send error message back to client
            }
        }
    )
    socket.on('correctGuess', (guessData) => {
        io.to(guessData.chatroomId).emit('correctGuess', guessData)
    })

    let timeoutId
    socket.on('audioEnded', (chatroomId) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            console.log('Audio ended for chatroom', chatroomId)
            io.to(chatroomId).emit('syncTimeOut')
        }, 5000)
    })

    // socket.on('gameOver', (author, chatroomId) => {
    //     console.log('Game is over')
    //     io.to(chatroomId).emit('gameOver', author)
    // })
})

httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

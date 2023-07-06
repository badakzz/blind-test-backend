import express from "express"
import * as http from "http"
import { Server } from "socket.io"
import ChatMessage from "../http-server/models/ChatMessage"
import GameService from "../http-server/utils/services/GameService"

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
})

const PORT = process.env.NODE_WEBSOCKET_PORT || 3001

const connectedUsers: { id: string; username: string; chatroomId: string }[] =
    []
const chatrooms = []
const gameServices = {}

console.log("userArray", connectedUsers)

io.on("connection", async (socket) => {
    console.log(`User connected with ID: ${socket.id}`)

    socket.on("createRoom", (username, chatroomId) => {
        socket.join(chatroomId)
        connectedUsers.push({ id: socket.id, username, chatroomId })
        io.to(chatroomId).emit("userConnected", username)
        io.to(chatroomId).emit(
            "connectedUsers",
            connectedUsers.filter((user) => user.chatroomId === chatroomId)
        )
        chatrooms.push(chatroomId)
        console.log(
            `User ${username} created and joined chatroom ${chatroomId}`
        )
        gameServices[chatroomId] = new GameService(chatroomId, io)
    })

    socket.on("joinRoom", (username, chatroomId) => {
        const chatroom = chatrooms.find((c) => c === chatroomId)
        if (chatroom) {
            // Add the user to the connectedUsers array here
            connectedUsers.push({ id: socket.id, username, chatroomId })

            // Join the user to the chatroom
            socket.join(chatroomId)

            io.to(chatroomId).emit("userConnected", username)
            io.to(chatroomId).emit(
                "connectedUsers",
                connectedUsers.filter((user) => user.chatroomId === chatroomId)
            )
            console.log(`User ${username} joined chatroom ${chatroom}`)
        } else {
            console.log(`Chatroom with ID: ${chatroomId} not found.`)
        }
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected with ID: ${socket.id}`)
        const index = connectedUsers.findIndex((u) => u.id === socket.id)
        if (index !== -1) {
            const user = connectedUsers.splice(index, 1)[0]
            io.emit("userDisconnected", user)
            io.to(user.chatroomId).emit(
                "connectedUsers",
                connectedUsers.filter(
                    (usr) => usr.chatroomId === user.chatroomId
                )
            )
            console.log(`User ${user.username} left the chatroom`)
        }
    })

    socket.on("chatMessage", (message) => {
        console.log(
            `Received message ${message.content} from ${message.author} in chatroom ${message.chatroomId}`
        )
        io.to(message.chatroomId).emit("chatMessage", message)
        if (gameServices[message.chatroomId]) {
            gameServices[message.chatroomId].processChatMessage({
                chatroom_id: message.chatroomId,
                author: message.author,
                content: message.content,
                user_id: message.userId,
            } as ChatMessage)
        }
    })

    socket.on("startGame", (gameData) => {
        console.log(
            `Received game data in room ${gameData.chatroomId}: current song ${gameData.currentSong.preview_url}\n tracklist \n ${gameData.trackPreviewList[0]}`
        )
        io.to(gameData.chatroomId).emit("gameStarted", {
            currentSong: gameData.currentSong, // Send the whole song object, not just the ID
            trackPreviewList: gameData.trackPreviewList,
        })
    })

    socket.on("correctGuess", (guessData) => {
        io.to(guessData.chatroomId).emit("correctGuess", guessData)
    })

    socket.on("gameOver", (author, chatroomId) => {
        console.log("Game is over")
        io.to(chatroomId).emit("gameOver", author)
    })
})

httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

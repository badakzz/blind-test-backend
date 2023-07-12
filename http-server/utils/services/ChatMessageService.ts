import axios from "axios"
import { Server } from "socket.io"
import UserController from "../../controllers/UserController"
import ChatMessage from "../../models/ChatMessage"
import GuessService from "./GuessService"
import Song from "../../models/Song"
import Chatroom from "../../models/Chatroom"
import { generateUniqueId } from "../helpers"
import { sequelizeErrorHandler } from "../ErrorHandlers"
import { Request, Response } from "express"
import User from "../../models/User"

export default class ChatMessageService {
    static async processChatMessage(
        message: ChatMessage,
        chatroomId,
        io: Server
    ) {
        try {
            // Send request to get the current song
            const response = await axios.get(
                `${process.env.NODE_SERVER_DOMAIN}:${process.env.NODE_SERVER_PORT}/api/v1/chatrooms/${message.chatroom_id}`
            )
            if (response.data.current_song_playing_id) {
                const guessData = {
                    chatroomId: message.chatroom_id,
                    userId: message.user_id,
                    songId: response.data.current_song_playing_id,
                    guess: message.content,
                    io: io,
                }
                console.log("guessData", guessData)
                // Call the createGuess method with these parameters and the io instance
                const result = await GuessService.createGuess(
                    guessData.chatroomId,
                    guessData.userId,
                    guessData.songId,
                    guessData.guess,
                    io
                )
                // Emit response back to the client
                const username = UserController.getUserById(result.userId)
                const correctGuessMessage = {
                    content: `${message.author} guessed the ${result.correctGuessType} correctly!`,
                    author: "SYSTEM",
                }
                result.points > 1
                    ? io
                          .to(chatroomId)
                          .emit("gameOver", message.author, message.chatroom_id)
                    : io.to(chatroomId).emit("chatMessage", correctGuessMessage)
            } else {
                io.to(message.chatroom_id).emit(
                    "error",
                    "No song is currently playing."
                )
            }
        } catch (error) {
            console.error(error)
            io.to(message.chatroom_id).emit(
                "error",
                "An error occurred while processing your message."
            )
        }
    }

    static async createMessage(req: Request): Promise<ChatMessage> {
        const user = await User.findByPk(req.body.user_id)
        if (!user) {
            throw new Error("User not found")
        }

        // Create new message with author field
        const newMessage = await ChatMessage.create({
            ...req.body,
            author: user.user_name, // add the author field here
        })

        return newMessage
    }
}

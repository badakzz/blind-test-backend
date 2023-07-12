import { Request, Response } from "express"
import ChatMessage from "../models/ChatMessage"
import User from "../models/User"
import { sequelizeErrorHandler } from "../utils/ErrorHandlers"
import { Server } from "socket.io"
import axios from "axios"
import GuessController from "./GuessController"
import UserController from "./UserController"

class ChatMessageController {
    static async getMessage(req: Request, res: Response): Promise<void> {
        try {
            const message = await ChatMessage.findByPk(req.params.id)
            res.json(message)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getMessagesFromUser(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const messages = await ChatMessage.findAll({
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["username"],
                    },
                ],
            })

            res.json(messages)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    // static async createMessage(req: Request, res: Response): Promise<void> {
    //     try {
    //         const newMessage = await ChatMessageService.createMessage(req)
    //         res.json(newMessage)
    //     } catch (error) {
    //         sequelizeErrorHandler(error)
    //         res.status(500).send(error.message)
    //     }
    // }

    static async updateMessage(req: Request, res: Response): Promise<void> {
        try {
            const chatMessageId = Number(req.params.id)
            if (isNaN(chatMessageId)) {
                res.status(400).json({ error: "Invalid chat_message_id" })
                return
            }
            await ChatMessage.update(req.body, {
                where: { chat_message_id: chatMessageId },
            })
            const updatedMessage = await ChatMessage.findByPk(chatMessageId)
            res.json(updatedMessage)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async deleteMessage(req: Request, res: Response): Promise<void> {
        try {
            await ChatMessage.destroy({
                where: { chat_message_id: Number(req.params.id) },
            })
            res.json({ message: "Message deleted" })
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

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
                const result = await GuessController.createGuess(
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
            author: user.username, // add the author field here
        })

        return newMessage
    }

    //     static async processChatMessage(
    //         req: Request,
    //         res: Response
    //     ): Promise<void> {
    //         try {
    //             const chatroom_id = req.body.chatroom_id
    //             const author = req.body.author
    //             const content = req.body.content
    //             const user_id = req.body.user_id
    //             const io = req.body.io

    //             const message = { chatroom_id, author, content, user_id }
    //             const updated = await ChatMessageService.processChatMessage(
    //                 //@ts-ignore
    //                 message,
    //                 chatroom_id,
    //                 io
    //             )

    //             // We send the updated chat message back to the client
    //             res.status(200).send(updated)
    //         } catch (error) {
    //             sequelizeErrorHandler(error)
    //             res.status(500).send(error.message)
    //         }
    //     }
}

export default ChatMessageController

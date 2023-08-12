import { Request, Response } from 'express'
import ChatMessage from '../models/ChatMessage'
import User from '../models/User'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'
import { Server } from 'socket.io'
import axios from 'axios'
import GuessController from './GuessController'
import UserController from './UserController'
import { Guess } from '../models'
const { Op } = require('sequelize')

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
                        as: 'user',
                        attributes: ['username'],
                    },
                ],
            })

            res.json(messages)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async updateMessage(req: Request, res: Response): Promise<void> {
        try {
            const chatMessageId = Number(req.params.id)
            if (isNaN(chatMessageId)) {
                res.status(400).json({ error: 'Invalid chat_message_id' })
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
            res.json({ message: 'Message deleted' })
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

                const result = await GuessController.createGuess(
                    guessData.chatroomId,
                    guessData.userId,
                    guessData.songId,
                    guessData.guess,
                    io
                )
                const username = UserController.getUserById(result.userId)
                const correctGuessMessage = {
                    content: `${message.author} guessed the ${result.correctGuessType} correctly!`,
                    author: 'SYSTEM',
                }
                if (result.points === 2) {
                    io.to(chatroomId).emit('chatMessage', correctGuessMessage)
                    io.to(chatroomId).emit('gameOver')
                } else if (
                    result.points > 0 &&
                    result.correctGuessType.length > 0
                ) {
                    io.to(chatroomId).emit('chatMessage', correctGuessMessage)
                    const guess = await Guess.findOne({
                        where: {
                            guess_id: result.guess.guess_id,
                            artist_guesser_id: { [Op.ne]: null },
                            song_guesser_id: { [Op.ne]: null },
                        },
                    })
                    if (guess) {
                        io.to(chatroomId).emit('artistAndSongNamesFound')
                    }
                }
            }
        } catch (error) {
            console.error(error)
            io.to(message.chatroom_id).emit(
                'error',
                'An error occurred while processing your message.'
            )
        }
    }

    static async createMessage(req: Request): Promise<ChatMessage> {
        const user = await User.findByPk(req.body.user_id)
        if (!user) {
            throw new Error('User not found')
        }

        const newMessage = await ChatMessage.create({
            ...req.body,
            author: user.username,
        })

        return newMessage
    }
}

export default ChatMessageController

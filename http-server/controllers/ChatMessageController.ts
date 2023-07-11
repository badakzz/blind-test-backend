import { Request, Response } from "express"
import ChatMessage from "../models/ChatMessage"
import User from "../models/User"
import { sequelizeErrorHandler } from "../utils/ErrorHandlers"
import ChatMessageService from "../utils/services/ChatMessageService"

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

    static async createMessage(req: Request, res: Response): Promise<void> {
        try {
            const newMessage = await ChatMessageService.createMessage(req)
            res.json(newMessage)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

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

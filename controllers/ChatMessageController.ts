import { Request, Response } from 'express'
import ChatMessage from '../models/ChatMessage'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'

class ChatMessageController {
    async getMessage(req: Request, res: Response): Promise<void> {
        try {
            const message = await ChatMessage.findByPk(
                req.params.chat_message_id
            )
            res.json(message)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    async createMessage(req: Request, res: Response): Promise<void> {
        try {
            const newMessage = await ChatMessage.create(req.body)
            res.json(newMessage)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    async updateMessage(req: Request, res: Response): Promise<void> {
        try {
            await ChatMessage.update(req.body, {
                where: { chat_message_id: Number(req.params.chat_message_id) },
            })
            const updatedMessage = await ChatMessage.findByPk(
                Number(req.params.chat_message_id)
            )
            res.json(updatedMessage)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    async deleteMessage(req: Request, res: Response): Promise<void> {
        try {
            await ChatMessage.destroy({
                where: { chat_message_id: Number(req.params.chat_message_id) },
            })
            res.json({ message: 'Message deleted' })
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default new ChatMessageController()

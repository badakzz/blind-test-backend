import { Request, Response } from 'express'
import ChatMessage from '../models/ChatMessage'

class ChatMessageController {
    async getMessage(req: Request, res: Response): Promise<void> {
        const message = await ChatMessage.findByPk(req.params.chat_message_id)
        res.json(message)
    }

    async createMessage(req: Request, res: Response): Promise<void> {
        const newMessage = await ChatMessage.create(req.body)
        res.json(newMessage)
    }

    async updateMessage(req: Request, res: Response): Promise<void> {
        await ChatMessage.update(req.body, {
            where: { chat_message_id: Number(req.params.chat_message_id) },
        })
        const updatedMessage = await ChatMessage.findByPk(
            Number(req.params.chat_message_id)
        )
        res.json(updatedMessage)
    }

    async deleteMessage(req: Request, res: Response): Promise<void> {
        await ChatMessage.destroy({
            where: { chat_message_id: Number(req.params.chat_message_id) },
        })
        res.json({ message: 'Message deleted' })
    }
}

export default new ChatMessageController()

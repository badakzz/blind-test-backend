import { Request, Response } from 'express'
import Chatroom from '../models/Chatroom'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'

class ChatroomController {
    static async getChatrooms(req: Request, res: Response): Promise<void> {
        try {
            const chatrooms = await Chatroom.findAll()
            res.send(chatrooms)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getChatroom(req: Request, res: Response): Promise<void> {
        try {
            const chatroom = await Chatroom.findByPk(req.params.id)
            res.send(chatroom)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
    static async createChatroom(req: Request, res: Response): Promise<void> {
        try {
            const newChatroom = await Chatroom.create(req.body)
            res.status(201).send(newChatroom)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async deleteChatroom(req: Request, res: Response): Promise<void> {
        try {
            const chatroom = await Chatroom.findByPk(req.params.id)

            if (chatroom) {
                await chatroom.destroy()
                res.status(204).send('Chatroom deleted')
            } else {
                res.status(404).send('Chatroom not found')
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default ChatroomController

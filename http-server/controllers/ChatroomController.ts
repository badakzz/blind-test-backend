import { Request, Response } from "express"
import Chatroom from "../models/Chatroom"
import { sequelizeErrorHandler } from "../../http-server/utils/ErrorHandlers"
import { generateUniqueId } from "../utils/helpers"
import Song from "../models/Song"

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
            const chatroom = {
                chatroom_id: generateUniqueId(),
                ...req.body,
            }

            const newChatroom = await Chatroom.create(chatroom)
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
                res.status(204).send("Chatroom deleted")
            } else {
                res.status(404).send("Chatroom not found")
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getCurrentSongPlayingId(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const chatroom = await Chatroom.findByPk(req.params.id)
            if (chatroom) {
                res.status(200).send({
                    current_song_playing_id: chatroom.current_song_playing_id,
                })
            } else {
                res.status(404).send("Chatroom not found")
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default ChatroomController

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

    static async setCurrentSongPlaying(
        req: Request,
        res: Response
    ): Promise<any> {
        try {
            // check if song_id exists in the Songs table
            const songExists = await Song.findByPk(
                req.body.chatroom_current_song_id
            )
            if (!songExists) {
                return res.status(400).json({ error: "Invalid song id" })
            }

            // check if chatroom_id exists in the Chatrooms table
            const chatroomExists = await Chatroom.findByPk(
                req.params.chatroom_id
            )
            if (!chatroomExists) {
                return res.status(400).json({ error: "Invalid chatroom id" })
            }

            const [updatedCount, updatedRows] = await Chatroom.update(
                {
                    current_song_playing_id: req.body.chatroom_current_song_id,
                },
                {
                    where: { chatroom_id: req.params.chatroom_id },
                    returning: true,
                }
            )

            if (updatedCount === 0) {
                return res
                    .status(400)
                    .json({ error: "Chatroom could not be updated." })
            }
            res.json(updatedRows[0])
        } catch (error) {
            console.error(
                `Error caught in PUT '/api/chatrooms/:chatroom_id/current_song_id' route: ${error}`
            )
            res.status(500).json({ error: error.toString() })
        }
    }
}

export default ChatroomController

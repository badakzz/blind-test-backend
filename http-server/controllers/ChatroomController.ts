import { Request, Response } from 'express'
import Chatroom from '../models/Chatroom'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'
import { generateUniqueId } from '../utils/helpers'
import Song from '../models/Song'

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
                res.status(204).send('Chatroom deleted')
            } else {
                res.status(404).send('Chatroom not found')
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
                res.status(404).send('Chatroom not found')
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async updateCurrentSong(
        chatroomId: string,
        currentSongId: string
    ): Promise<Chatroom | null> {
        const chatroom = await Chatroom.findByPk(chatroomId)
        if (chatroom) {
            chatroom.current_song_playing_id = currentSongId
            await chatroom.save()
            return chatroom
        }
        return null
    }

    static async setCurrentSongPlaying(
        chatroomCurrentPlayingSongId,
        chatroomId: string,
        res: Response
    ): Promise<any> {
        try {
            // check if song_id exists in the Songs table
            const songExists = await Song.findByPk(chatroomCurrentPlayingSongId)
            if (!songExists) {
                console.error({ error: 'Invalid song id' })
            }

            // check if chatroom_id exists in the Chatrooms table
            const chatroomExists = await Chatroom.findByPk(chatroomId)
            if (!chatroomExists) {
                return console.error({ error: 'Invalid chatroom id' })
            }

            const [updatedCount, updatedRows] = await Chatroom.update(
                {
                    current_song_playing_id: chatroomCurrentPlayingSongId,
                },
                {
                    where: { chatroom_id: chatroomId },
                    returning: true,
                }
            )

            if (updatedCount === 0) {
                return console.error({
                    error: 'Chatroom could not be updated.',
                })
            }
            return updatedRows[0]
        } catch (error) {
            console.error(
                `Error caught in PUT '/api/chatrooms/:chatroom_id/current_song_id' route: ${error}`
            )
            console.error({ error: error.toString() })
        }
    }
}

export default ChatroomController

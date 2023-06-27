import { Request, Response } from 'express'
import Playlist from '../models/Playlist'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'

class PlaylistController {
    static async getPlaylists(req: Request, res: Response) {
        try {
            const playlists = await Playlist.findAll()
            res.send(playlists)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getPlaylist(req: Request, res: Response) {
        try {
            const playlist = await Playlist.findByPk(req.params.id)
            res.send(playlist)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default PlaylistController

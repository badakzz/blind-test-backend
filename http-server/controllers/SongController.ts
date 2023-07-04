import { Request, Response } from 'express'
import Song from '../models/Song'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'
import sequelize from '../config/database'

class SongController {
    static async getSongs(req: Request, res: Response): Promise<void> {
        try {
            const songs = await Song.findAll()
            res.send(songs)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getSong(req: Request, res: Response): Promise<void> {
        try {
            const song = await Song.findByPk(req.params.id)
            res.send(song)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getRandomSong(playlistId: number) {
        const song = await Song.findOne({
            where: { playlistId }, // Use the playlistId in the query
            order: sequelize.random(), // sequelize.random() generates a random order
        })
        if (!song) {
            throw new Error('No songs found')
        }

        return song
    }

    static async createSong(req: Request, res: Response): Promise<void> {
        try {
            const newSong = await Song.create(req.body)
            res.status(201).send(newSong)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async deleteSong(req: Request, res: Response): Promise<void> {
        try {
            const song = await Song.findByPk(req.params.id)

            if (song) {
                await song.destroy()
                res.status(204).send('Song deleted')
            } else {
                res.status(404).send('Song not found')
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default SongController
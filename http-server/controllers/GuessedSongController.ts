import { Request, Response } from 'express'
import GuessedSong from '../models/GuessedSong'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'

class GuessedSongController {
    static async getGuessedSongs(req: Request, res: Response) {
        try {
            const guessedSongs = await GuessedSong.findAll()
            res.send(guessedSongs)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getGuessedSong(req: Request, res: Response) {
        try {
            const guessedSong = await GuessedSong.findByPk(req.params.id)
            res.send(guessedSong)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default GuessedSongController

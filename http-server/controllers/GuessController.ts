import { Request, Response } from 'express'
import Guess from '../models/Guess'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'

class GuessController {
    static async getGuesses(req: Request, res: Response): Promise<void> {
        try {
            const guesses = await Guess.findAll()
            res.send(guesses)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getGuess(req: Request, res: Response): Promise<void> {
        try {
            const guess = await Guess.findByPk(req.params.id)
            res.send(guess)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async createGuess(req: Request, res: Response): Promise<void> {
        try {
            const newGuess = await Guess.create(req.body)
            res.status(201).send(newGuess)
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async deleteGuess(req: Request, res: Response): Promise<void> {
        try {
            const guess = await Guess.findByPk(req.params.id)

            if (guess) {
                await guess.destroy()
                res.status(204).send('Guess deleted')
            } else {
                res.status(404).send('Guess not found')
            }
        } catch (error: any) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default GuessController

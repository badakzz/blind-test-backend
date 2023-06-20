import { Request, Response } from 'express'
import Scoreboard from '../models/Scoreboard'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'

class ScoreboardController {
    static async getScoreboards(req: Request, res: Response): Promise<void> {
        try {
            const scoreboards = await Scoreboard.findAll()
            res.send(scoreboards)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getScoreboard(req: Request, res: Response): Promise<void> {
        try {
            const scoreboard = await Scoreboard.findByPk(req.params.id)
            res.send(scoreboard)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async createScore(req: Request, res: Response): Promise<void> {
        try {
            const newScore = await Scoreboard.create(req.body)
            res.status(201).send(newScore)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async updateScoreboard(req: Request, res: Response): Promise<void> {
        const { user_id, chatroom_id, points } = req.body

        try {
            const existingScoreboard = await Scoreboard.findOne({
                where: { user_id, chatroom_id },
            })

            if (existingScoreboard) {
                existingScoreboard.points = points
                await existingScoreboard.save()
                res.json({ message: 'Scoreboard updated successfully' })
            } else {
                res.status(404).json({ error: 'Scoreboard not found' })
            }
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default ScoreboardController

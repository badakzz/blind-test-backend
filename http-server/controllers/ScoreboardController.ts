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

    static async updateScoreboard(
        user_id: number,
        chatroom_id: string,
        points: number,
        io
    ) {
        // Check if the user's score exists in the scoreboard
        let score = await Scoreboard.findOne({
            where: { user_id: user_id, chatroom_id: chatroom_id },
        })

        if (score) {
            // Update the score
            score.points += points
            await score.save()
        } else {
            // Create a new score
            score = await Scoreboard.create({ user_id, chatroom_id, points })
        }

        if (score) {
            // Emit the updated score
            io.to(chatroom_id).emit('scoreUpdate', score)
            return score
        } else return null
    }
}

export default ScoreboardController

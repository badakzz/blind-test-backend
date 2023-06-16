// src/controllers/scoreboard.ts

import { Request, Response } from 'express'
import Scoreboard from '../models/Scoreboard'

class ScoreboardController {
    static async getScoreboards(req: Request, res: Response): Promise<void> {
        try {
            const scoreboards = await Scoreboard.findAll()
            res.send(scoreboards)
        } catch (error: any) {
            res.status(500).send(error.message)
        }
    }

    static async getScoreboard(req: Request, res: Response): Promise<void> {
        try {
            const scoreboard = await Scoreboard.findByPk(req.params.id)
            res.send(scoreboard)
        } catch (error: any) {
            res.status(500).send(error.message)
        }
    }

    static async createScore(req: Request, res: Response): Promise<void> {
        try {
            const newScore = await Scoreboard.create(req.body)
            res.status(201).send(newScore)
        } catch (error: any) {
            console.log(error)
            res.status(500).send(error.message)
        }
    }
}

export default ScoreboardController

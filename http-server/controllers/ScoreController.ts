import { Request, Response } from "express"
import Score from "../models/Score"
import { sequelizeErrorHandler } from "../utils/ErrorHandlers"
import { Server } from "socket.io"

class ScoreController {
    // static async getScores(req: Request, res: Response): Promise<void> {
    //     try {
    //         const scores = await Score.findAll()
    //         res.send(scores)
    //     } catch (error) {
    //         sequelizeErrorHandler(error)
    //         res.status(500).send(error.message)
    //     }
    // }

    // static async getScore(req: Request, res: Response): Promise<void> {
    //     try {
    //         const score = await Score.findByPk(req.params.id)
    //         res.send(score)
    //     } catch (error) {
    //         sequelizeErrorHandler(error)
    //         res.status(500).send(error.message)
    //     }
    // }

    static async getScoresByChatroom(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const scores = await Score.findAll({
                where: { chatroom_id: req.params.chatroomId },
            })
            res.send(scores)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async createScore(req: Request, res: Response): Promise<void> {
        try {
            const newScore = await Score.create(req.body)
            res.status(201).send(newScore)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default ScoreController

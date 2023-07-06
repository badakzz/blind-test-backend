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

    static async updateScore(
        user_id: number,
        chatroom_id: string,
        points: number,
        correctGuessType: string,
        io: Server
    ): Promise<{
        userId: number
        correctGuessType: string
        points: number
    } | null> {
        // Check if the user's score exists in the score
        let score = await Score.findOne({
            where: { user_id: user_id, chatroom_id: chatroom_id },
        })

        if (score) {
            // Update the score
            score.points += points
            await score.save()
        } else {
            // Create a new score
            score = await Score.create({ user_id, chatroom_id, points })
        }

        if (score) {
            // Emit the updated score
            io.to(chatroom_id).emit("scoreUpdate", score)
            return {
                userId: user_id,
                correctGuessType: correctGuessType,
                points: score.points,
            }
        } else return null
    }
}

export default ScoreController

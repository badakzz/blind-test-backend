import { Request, Response } from 'express'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'
import { Server } from 'socket.io'
import { Score, User } from '../models'

class ScoreController {
    static async getScoresByChatroom(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const scores = await Score.findAll({
                where: { chatroom_id: req.params.chatroomId },
                include: {
                    model: User,
                    attributes: ['username'],
                },
            })
            const formattedScores = scores.map((score) => ({
                username: score.username,
                points: score.points,
            }))
            res.send(formattedScores)
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

    static async updateOrCreateScore(
        user_id: number,
        chatroom_id: string,
        points: number,
        username: string,
        correctGuessType: string,
        io: Server,
        transaction: any
    ): Promise<{
        userId: number
        correctGuessType: string
        points: number
        username: string
    } | null> {
        let score = await Score.findOne({
            where: { user_id: user_id, chatroom_id: chatroom_id },
            transaction,
        })

        if (score) {
            score.points += points
            await score.save({ transaction })
        } else {
            score = await Score.create(
                { user_id, chatroom_id, points, username },
                { transaction }
            )
        }

        if (score) {
            io.to(chatroom_id).emit('scoreUpdate', score)
            return {
                userId: user_id,
                correctGuessType: correctGuessType,
                points: score.points,
                username: username,
            }
        } else return null
    }
}

export default ScoreController

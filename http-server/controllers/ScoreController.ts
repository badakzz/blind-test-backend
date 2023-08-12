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
                //@ts-ignore
                username: score.User.username,
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

    static async updateScore(
        user_id: number,
        chatroom_id: string,
        points: number,
        correctGuessType: string,
        io: Server,
        transaction: any
    ): Promise<{
        userId: number
        correctGuessType: string
        points: number
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
                { user_id, chatroom_id, points },
                { transaction }
            )
        }

        if (score) {
            io.to(chatroom_id).emit('scoreUpdate', score)
            return {
                userId: user_id,
                correctGuessType: correctGuessType,
                points: score.points,
            }
        } else return null
    }

    static async updateScoreboardOld(
        req: Request,
        res: Response
    ): Promise<void> {
        const { user_id, chatroom_id, points } = req.body

        try {
            const existingScoreboard = await Score.findOne({
                where: { user_id, chatroom_id },
            })

            if (existingScoreboard) {
                existingScoreboard.points = points
                await existingScoreboard.save()
                res.json({ message: 'Score updated successfully' })
            } else {
                res.status(404).json({ error: 'Score not found' })
            }
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default ScoreController

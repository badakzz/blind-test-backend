import { Request, Response } from 'express'
import Guess from '../models/Guess'
import ScoreController from './ScoreController'
import { analyzeAnswer, normalizeAnswer } from '../utils/helpers'
import SongController from './SongController'
import { Server } from 'socket.io'
import sequelize from '../config/database'
import { User } from '../models'

class GuessController {
    static async getGuess(req: Request, res: Response) {
        const guess = await Guess.findOne({
            where: { chatroom_id: req.params.chatroomId },
            include: ['song', 'songGuesser', 'artistGuesser'],
        })
        res.json(guess)
    }

    static async createGuess(
        chatroomId: string,
        userId: number,
        songId: number,
        guess: string,
        io: Server
    ): Promise<{
        userId: number
        correctGuessType: string
        points: number
        guess: Guess
    } | null> {
        const transaction = await sequelize.transaction()
        try {
            const song = await SongController.getSongById(songId, transaction)

            const normalizedGuessWords = normalizeAnswer(guess)
            const normalizedSongName = normalizeAnswer(song.song_name)
            const normalizedArtistName = normalizeAnswer(song.artist_name)

            const { points, correctGuessType } = analyzeAnswer(
                normalizedSongName,
                normalizedGuessWords,
                normalizedArtistName
            )

            let existingGuess = await Guess.findOne({
                where: { chatroom_id: chatroomId, song_id: songId },
                transaction,
            })

            const user = await User.findByPk(userId)
            const username = user.username

            if (
                existingGuess &&
                ((correctGuessType === 'song name' &&
                    existingGuess.song_guesser_id !== null) ||
                    (correctGuessType === 'artist name' &&
                        existingGuess.artist_guesser_id !== null))
            ) {
                await transaction.rollback()
                return null
            }

            if (!existingGuess) {
                existingGuess = await Guess.create(
                    {
                        chatroom_id: chatroomId,
                        song_id: songId,
                    },
                    { transaction }
                )
            }

            if (
                correctGuessType.includes('song name') ||
                correctGuessType === 'artist and the song names'
            ) {
                existingGuess.song_guesser_id = userId
            }
            if (
                correctGuessType.includes('artist name') ||
                correctGuessType === 'artist and the song names'
            ) {
                existingGuess.artist_guesser_id = userId
            }

            await existingGuess.save({ transaction })

            const newScore = await ScoreController.updateOrCreateScore(
                userId,
                chatroomId,
                points,
                username,
                correctGuessType,
                io,
                transaction
            )

            await transaction.commit()

            return {
                userId: newScore?.userId || userId,
                correctGuessType: correctGuessType,
                points: newScore?.points || 0,
                guess: existingGuess,
            }
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }

    static async deleteGuessesByChatroom(chatroomId: string): Promise<void> {
        try {
            await Guess.destroy({
                where: { chatroom_id: chatroomId },
            })
            console.log(`Guesses reset in chatroom ${chatroomId}`)
        } catch (error: any) {
            console.error(
                `Failed to reset guesses in chatroom ${chatroomId}:`,
                error.message
            )
        }
    }
}

export default GuessController

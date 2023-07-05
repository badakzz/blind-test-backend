import { Request, Response } from "express"
import Guess from "../models/Guess"
import { analyzeAnswerAndAttributeScore } from "../utils/helpers"
import ScoreController from "./ScoreController"
import { Server } from "socket.io"
import SongController from "./SongController"

class GuessController {
    static async createGuess(
        chatroomId: string,
        userId: number,
        songId: number,
        guess: string,
        io: Server
    ): Promise<{ userId: number; correctGuessType: string; points: number }> {
        // Fetch the current song from the database
        const song = await SongController.fetchSong(songId)

        // Normalize the guess
        const normalizedGuessWords = guess.split(" ")

        // Analyze the answer and get the score
        const scoreData = analyzeAnswerAndAttributeScore(
            userId,
            chatroomId,
            song.song_name.split(" "),
            normalizedGuessWords,
            song.artist_name.split(" ")
        )
        // Update the Score
        const score = await ScoreController.updateScore(
            userId,
            chatroomId,
            scoreData.points,
            io
        )

        return score
            ? {
                  userId: scoreData.userId,
                  correctGuessType: scoreData.correctGuessType,
                  points: score.points,
              }
            : null
    }

    static async getGuess(req: Request, res: Response) {
        const guess = await Guess.findOne({
            where: { chatroom_id: req.params.chatroomId },
            include: ["song", "songGuesser", "artistGuesser"],
        })
        res.json(guess)
    }
}

export default GuessController

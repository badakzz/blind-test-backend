import { Server } from "socket.io"
import Guess from "../../models/Guess"
import { analyzeAnswer } from "../helpers"
import SongService from "./SongService"
import ScoreService from "./ScoreService"

export default class GuessService {
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
    } | null> {
        // Fetch the current song from the database
        const song = await SongService.getSongById(songId)

        // Normalize the guess
        const normalizedGuessWords = guess.split(" ")

        console.log({ chatroomId, userId, songId, guess, io: Server })
        // Analyze the answer and get the scoreData
        const { points, correctGuessType } = analyzeAnswer(
            song.song_name.split(" "),
            normalizedGuessWords,
            song.artist_name.split(" ")
        )

        // Fetch the existing guess record for the song in the chat room
        let existingGuess = await Guess.findOne({
            where: { chatroom_id: chatroomId, song_id: songId },
        })
        console.log("points", points, correctGuessType)
        console.log("existingGuess", existingGuess)

        // If the guess already exists and correct guess is found, don't update the score
        if (
            existingGuess &&
            ((correctGuessType === "song name" &&
                existingGuess.song_guesser_id !== null) ||
                (correctGuessType === "artist name" &&
                    existingGuess.artist_guesser_id !== null))
        ) {
            return null
        }

        // Update the guess record with the userId if it doesn't already exist
        if (!existingGuess) {
            existingGuess = await Guess.create({
                chatroom_id: chatroomId,
                song_id: songId,
            })
        }
        console.log("aftercheckexistingGuess", existingGuess)

        // Update the correct guesser id based on the correctGuessType
        if (correctGuessType === "song name") {
            existingGuess.song_guesser_id = userId
        } else if (correctGuessType === "artist name") {
            existingGuess.artist_guesser_id = userId
        }

        await existingGuess.save()

        // Attribute score
        const newScore = await ScoreService.updateScore(
            userId,
            chatroomId,
            points,
            correctGuessType,
            io
        )

        console.log("newScore", newScore)

        return {
            userId: newScore?.userId || userId,
            correctGuessType: correctGuessType,
            points: newScore?.points || 0,
        }
    }
}

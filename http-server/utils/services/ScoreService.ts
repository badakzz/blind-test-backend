import { Server } from "socket.io"
import Score from "../../models/Score"

export default class SongService {
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

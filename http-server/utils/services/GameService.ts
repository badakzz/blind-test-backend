import axios from "axios"
import { Server } from "socket.io"
import GuessController from "../../controllers/GuessController"
import UserController from "../../controllers/UserController"
import ChatMessage from "../../models/ChatMessage"

export default class GameService {
    constructor(private chatroomId: string, private io: Server) {}

    async processChatMessage(message: ChatMessage) {
        try {
            // Send request to get the current song
            const response = await axios.get(
                `${process.env.NODE_SERVER_DOMAIN}:${process.env.NODE_SERVER_PORT}/api/v1/chatrooms/${message.chatroom_id}`
            )
            if (response.data.current_song_playing_id) {
                const guessData = {
                    chatroomId: message.chatroom_id,
                    userId: message.user_id,
                    songId: response.data.current_song_playing_id,
                    guess: message.content,
                    io: this.io,
                }
                // Call the createGuess method with these parameters and the io instance
                const result = await GuessController.createGuess(
                    guessData.chatroomId,
                    guessData.userId,
                    guessData.songId,
                    guessData.guess,
                    this.io
                )
                console.log("result", result)
                // Emit response back to the client
                const username = UserController.getUserById(result.userId)
                const correctGuessMessage = {
                    content: `${message.author} guessed the ${result.correctGuessType} correctly!`,
                    author: "SYSTEM",
                }
                result.points > 1
                    ? this.io
                          .to(this.chatroomId)
                          .emit("gameOver", message.author, message.chatroom_id)
                    : this.io
                          .to(this.chatroomId)
                          .emit("chatMessage", correctGuessMessage)
            } else {
                this.io
                    .to(message.chatroom_id)
                    .emit("error", "No song is currently playing.")
            }
        } catch (error) {
            console.error(error)
            this.io
                .to(message.chatroom_id)
                .emit(
                    "error",
                    "An error occurred while processing your message."
                )
        }
    }
}

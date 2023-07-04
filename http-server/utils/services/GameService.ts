import axios from 'axios'
import { Server } from 'socket.io'
import GuessController from '../../controllers/GuessController'
import UserController from '../../controllers/UserController'
import ChatMessage from '../../models/ChatMessage'

export default class GameService {
    constructor(private chatroomId: string, private io: Server) {}

    async processChatMessage(message: ChatMessage) {
        try {
            // Send request to get the current song
            const response = await axios.get(
                `${process.env.NODE_SERVER_DOMAIN}:${process.env.NODE_SERVER_PORT}/api/v1/chatrooms/${message.chatroom_id}`
            )
            console.log('retrieve current song id', response.data)
            if (response.data.current_song_playing_id) {
                const guessData = {
                    chatroomId: message.chatroom_id,
                    userId: message.author,
                    songId: response.data.current_song_playing_id,
                    guess: message.content,
                    io: this.io,
                }
                // console.log('guessData', {guessData})
                // Call the createGuess method with these parameters and the io instance
                const result = await GuessController.createGuess(
                    guessData.chatroomId,
                    guessData.userId as unknown as number,
                    guessData.songId,
                    guessData.guess,
                    this.io
                )
                console.log('result', result)
                // Emit response back to the client
                const username = UserController.getUserById(result.userId)
                const correctGuessMessage = {
                    content: `${username} guessed the ${result.correctGuessType} correctly!`,
                    author: 'SYSTEM',
                }
                this.io
                    .to(this.chatroomId)
                    .emit('chatMessage', correctGuessMessage)
            } else {
                this.io
                    .to(message.chatroom_id)
                    .emit('error', 'No song is currently playing.')
            }
        } catch (error) {
            console.error(error)
            this.io
                .to(message.chatroom_id)
                .emit(
                    'error',
                    'An error occurred while processing your message.'
                )
        }
    }
}

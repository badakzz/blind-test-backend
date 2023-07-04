import Game from '../models/Game'
import SongController from './SongController'

class GameController {
    static async startGame(chatroom_id: string, playlist_id: number) {
        const newSong = await SongController.getRandomSong(playlist_id)

        const game = await Game.create({
            chatroom_id,
            playlist_id,
            current_song_id: newSong.song_id,
        })

        return newSong
    }

    static async nextSong(chatroom_id: string) {
        const game = await Game.findOne({ where: { chatroom_id } })
        if (!game) {
            throw new Error('No game found for this session.')
        }

        const newSong = await SongController.getRandomSong(game.playlist_id)
        game.current_song_id = newSong.song_id
        await game.save()

        return newSong
    }
}

export default GameController

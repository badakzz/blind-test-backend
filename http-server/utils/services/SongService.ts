import axios from "axios"
import Song from "../../models/Song"
import sequelize from "../../config/database"

export default class SongService {
    static async getCurrentSong(chatroomId) {
        const response = await axios.get(
            `${process.env.NODE_SERVER_DOMAIN}:${process.env.NODE_SERVER_PORT}/api/v1/chatrooms/${chatroomId}`
        )
        return response.data.current_song_playing_id
    }

    static async getRandomSong(playlistId: number) {
        const song = await Song.findOne({
            where: { playlistId },
            order: sequelize.random(),
        })
        if (!song) {
            throw new Error("No songs found")
        }

        return song
    }

    static async getSongById(id: number): Promise<Song> {
        return await Song.findByPk(id)
    }
}

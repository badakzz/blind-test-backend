import Chatroom from "../../models/Chatroom"
import Song from "../../models/Song"

export default class ChatroomService {
    static async updateCurrentSong(
        chatroomId: string,
        currentSongId: string
    ): Promise<Chatroom | null> {
        const chatroom = await Chatroom.findByPk(chatroomId)
        console.log("chatroom received in service", chatroom)
        if (chatroom) {
            chatroom.current_song_playing_id = currentSongId
            await chatroom.save()
            return chatroom
        }
        return null
    }

    static async setCurrentSongPlaying(
        chatroomCurrentPlayingSongId,
        chatroomId: string,
        res: Response
    ): Promise<any> {
        try {
            // check if song_id exists in the Songs table
            const songExists = await Song.findByPk(chatroomCurrentPlayingSongId)
            if (!songExists) {
                console.error({ error: "Invalid song id" })
            }

            // check if chatroom_id exists in the Chatrooms table
            const chatroomExists = await Chatroom.findByPk(chatroomId)
            if (!chatroomExists) {
                return console.error({ error: "Invalid chatroom id" })
            }

            const [updatedCount, updatedRows] = await Chatroom.update(
                {
                    current_song_playing_id: chatroomCurrentPlayingSongId,
                },
                {
                    where: { chatroom_id: chatroomId },
                    returning: true,
                }
            )

            if (updatedCount === 0) {
                return console.error({
                    error: "Chatroom could not be updated.",
                })
            }
            return updatedRows[0]
        } catch (error) {
            console.error(
                `Error caught in PUT '/api/chatrooms/:chatroom_id/current_song_id' route: ${error}`
            )
            console.error({ error: error.toString() })
        }
    }
}

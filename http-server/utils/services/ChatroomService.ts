import Chatroom from "../../models/Chatroom"

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
}

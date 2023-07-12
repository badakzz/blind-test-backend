import { Model, DataTypes } from "sequelize"
import sequelize from "../config/database"
import Song from "./Song"

class Chatroom extends Model {
    public chatroom_id!: string
    public current_song_playing_id!: string | null
}

Chatroom.init(
    {
        chatroom_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        current_song_playing_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Song,
                key: "song_id",
            },
            allowNull: true,
        },
    },
    {
        tableName: "chatroom",
        sequelize,
        timestamps: true,
        underscored: true,
    }
)

export default Chatroom

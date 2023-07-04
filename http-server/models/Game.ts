import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Song from './Song'
import Playlist from './Playlist'
import Chatroom from './Chatroom'

class Game extends Model {
    public game_id!: number
    public playlist_id!: number
    public current_song_id!: number
    public chatroom_id!: string
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

Game.init(
    {
        game_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        playlist_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Playlist,
                key: 'playlist_id',
            },
        },
        current_song_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Song,
                key: 'song_id',
            },
        },
        chatroom_id: {
            type: DataTypes.STRING,
            references: {
                model: Chatroom,
                key: 'chatroom_id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Game',
        underscored: true,
    }
)

export default Game

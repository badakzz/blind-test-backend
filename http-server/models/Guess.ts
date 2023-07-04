import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Song from './Song'
import User from './User'
import Chatroom from './Chatroom'

class Guess extends Model {
    public guess_id!: number
    public chatroom_id!: string
    public song_id!: number
    public song_guesser_id!: number
    public artist_guesser_id!: number
}

Guess.init(
    {
        guess_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        chatroom_id: {
            type: DataTypes.STRING,
            references: {
                model: Chatroom,
                key: 'chatroom_id',
            },
        },
        song_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Song,
                key: 'song_id',
            },
        },
        song_guesser_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'user_id',
            },
        },
        artist_guesser_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'user_id',
            },
        },
    },
    {
        tableName: 'guesses',
        sequelize,
        timestamps: true,
        underscored: true,
    }
)

export default Guess

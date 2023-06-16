// src/models/guessed_song.ts

import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class GuessedSong extends Model {
    public id!: number
    public user_id!: number
    public chatroom_id!: string
    public guess!: string
    public guess_type!: string // "song" or "artist"
    public created_at!: Date
    public updated_at!: Date
}

GuessedSong.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        chatroom_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guess: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guess_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'guessed_songs',
        sequelize,
    }
)

export default GuessedSong

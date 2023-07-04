import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Guess from './Guess'

class Playlist extends Model {
    public playlist_id!: number
    public spotify_playlist_id!: string
    public name!: string
    public genre_id!: string
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

Playlist.init(
    {
        playlist_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        genre_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        spotify_playlist_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Playlist',
        timestamps: true,
        underscored: true,
    }
)

export default Playlist

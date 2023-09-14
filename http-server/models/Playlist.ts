import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Guess from './Guess'

class Playlist extends Model {
    public playlist_id!: number | string
    public spotify_playlist_id!: string
    public name!: string
    public genre_id!: string
}

Playlist.init(
    {
        playlist_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        genre_id: {
            type: DataTypes.STRING,
            allowNull: true,
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
        tableName: 'playlist',
        timestamps: true,
        underscored: true,
    }
)

export default Playlist

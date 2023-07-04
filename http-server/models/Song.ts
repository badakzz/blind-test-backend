import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import Playlist from './Playlist'

class Song extends Model {
    public song_id!: number
    public spotify_song_id!: string
    public song_name!: string
    public artist_name!: string
    public preview_url!: string
    public playlist_id!: number
}

Song.init(
    {
        song_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        spotify_song_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        song_name: {
            type: DataTypes.STRING,
        },
        artist_name: {
            type: DataTypes.STRING,
        },
        preview_url: {
            type: DataTypes.STRING,
        },
        playlist_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Playlist, // refers to Playlist model
                key: 'playlist_id',
            },
        },
    },
    {
        tableName: 'songs',
        sequelize,
        timestamps: false,
    }
)

export default Song

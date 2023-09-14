import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'
import Playlist from './Playlist'

class Song extends Model {
    public song_id!: number
    public spotify_song_id!: string
    public song_name!: string
    public artist_name!: string
    public preview_url!: string
    public playlist_id!: number | string
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
            unique: true,
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
            type: DataTypes.STRING,
            references: {
                model: Playlist,
                key: 'playlist_id',
            },
        },
    },
    {
        sequelize,
        tableName: 'song',
        timestamps: true,
        underscored: true,
    }
)

export default Song

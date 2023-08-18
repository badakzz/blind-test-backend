import { Sequelize, DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import Playlist from './Playlist'

interface SongAttributes {
    song_id: number
    spotify_song_id: string
    song_name: string
    artist_name: string
    preview_url: string
    playlist_id: number
}

interface SongCreationAttributes extends Optional<SongAttributes, 'song_id'> {}

class Song
    extends Model<SongAttributes, SongCreationAttributes>
    implements SongAttributes
{
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
            type: DataTypes.INTEGER,
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

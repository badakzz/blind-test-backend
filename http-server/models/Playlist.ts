import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../config/database'
import Guess from './Guess'

interface PlaylistAttributes {
    playlist_id: number
    spotify_playlist_id: string
    name: string
    genre_id: string
}

interface PlaylistCreationAttributes
    extends Optional<PlaylistAttributes, 'playlist_id'> {}

class Playlist
    extends Model<PlaylistAttributes, PlaylistCreationAttributes>
    implements PlaylistAttributes
{
    public playlist_id!: number
    public spotify_playlist_id!: string
    public name!: string
    public genre_id!: string
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
        tableName: 'playlist',
        timestamps: true,
        underscored: true,
    }
)

export default Playlist

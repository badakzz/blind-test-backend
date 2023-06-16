import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Playlist extends Model {
    public playlist_id!: number
    public playlist_name!: string
    public user_id!: number
}

Playlist.init(
    {
        playlist_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        playlist_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'playlists',
        sequelize,
    }
)

export default Playlist

import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Song extends Model {
    public spotify_song_id!: string
    public song_name!: string
    public artist_name!: string
    public preview_url!: string
}

Song.init(
    {
        spotify_song_id: {
            type: DataTypes.STRING,
            primaryKey: true,
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
    },
    {
        tableName: 'songs',
        sequelize,
        timestamps: false,
    }
)

export default Song

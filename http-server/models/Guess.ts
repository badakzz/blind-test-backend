import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Guess extends Model {
    public guess_id!: number
    public song_id!: string
    public user_id!: string
    public chatroom_id!: string
    public has_guessed_artist!: boolean
    public has_guessed_song!: boolean
    public timestamp!: Date
}

Guess.init(
    {
        guess_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        song_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'songs', // This is a reference to another model
                key: 'spotify_song_id', // This is the column name of the referenced model
            },
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        chatroom_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        has_guessed_artist: {
            type: DataTypes.BOOLEAN,
        },
        has_guessed_song: {
            type: DataTypes.BOOLEAN,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'guesses',
        sequelize,
        timestamps: false,
    }
)

export default Guess

import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../config/database'
import Chatroom from './Chatroom'
import User from './User'

interface ScoreAttributes {
    chatroom_id: string
    username: string
    user_id: number
    points: number
}

interface ScoreCreationAttributes
    extends Optional<ScoreAttributes, 'chatroom_id' | 'user_id'> {}

class Score
    extends Model<ScoreAttributes, ScoreCreationAttributes>
    implements ScoreAttributes
{
    public chatroom_id!: string
    public username!: string
    public user_id!: number
    public points!: number
}

Score.init(
    {
        chatroom_id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            references: { model: Chatroom, key: 'id' },
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: { model: User, key: 'user_id' },
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User,
                key: 'username',
            },
        },
        points: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: 'score',
        sequelize,
        timestamps: true,
        underscored: true,
    }
)

export default Score

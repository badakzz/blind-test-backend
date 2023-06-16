import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Scoreboard extends Model {
    public chatroom_id!: string
    public user_id!: number
    public points!: number
}

Scoreboard.init(
    {
        chatroom_id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        points: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: 'scoreboards',
        sequelize,
        timestamps: false,
    }
)

export default Scoreboard

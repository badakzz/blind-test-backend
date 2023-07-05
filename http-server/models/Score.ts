import { Model, DataTypes } from "sequelize"
import sequelize from "../config/database"

class Score extends Model {
    public chatroom_id!: string
    public user_id!: number
    public points!: number
}

Score.init(
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
        tableName: "scores",
        sequelize,
        timestamps: false,
    }
)

export default Score

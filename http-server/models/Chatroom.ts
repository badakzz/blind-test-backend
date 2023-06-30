import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class Chatroom extends Model {
    public chatroom_id!: string
    public created_at!: Date
    public updated_at!: Date
}

Chatroom.init(
    {
        chatroom_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    },
    {
        tableName: 'chatrooms',
        sequelize,
        timestamps: true,
        underscored: true,
    }
)

export default Chatroom

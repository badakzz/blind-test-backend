import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface UserAttributes {
    user_id: number
    user_name: string
    email: string
    password: string
    permissions: number
    is_active: boolean
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> {}

class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    public user_id!: number
    public user_name!: string
    public email!: string
    public password!: string
    public permissions!: number
    public is_active!: boolean

    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

User.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        permissions: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        underscored: true,
    }
)

export default User

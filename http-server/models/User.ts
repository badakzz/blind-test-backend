import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface UserAttributes {
    user_id: number
    username: string
    email?: string
    password?: string
    permissions: number
    is_active: boolean
    is_guest: boolean
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> {}

class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    public user_id!: number
    public username!: string
    public email?: string
    public password?: string
    public permissions!: number
    public is_active!: boolean
    public is_guest!: boolean
}

User.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
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
        is_guest: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'user_table',
        timestamps: true,
        underscored: true,
    }
)

export default User

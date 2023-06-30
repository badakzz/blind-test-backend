import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'

class BlacklistedToken extends Model {
    public token!: string
    public expiry!: Date
}

BlacklistedToken.init(
    {
        token: {
            type: DataTypes.TEXT,
            primaryKey: true,
        },
        expiry: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'blacklisted_tokens',
        timestamps: false,
    }
)

export default BlacklistedToken

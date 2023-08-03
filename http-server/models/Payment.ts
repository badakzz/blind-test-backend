import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface PaymentAttributes {
    id: number
    amount: number
    status: string
    stripe_payment_intent_id: string
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id'> {}

class Payment
    extends Model<PaymentAttributes, PaymentCreationAttributes>
    implements PaymentAttributes
{
    public id!: number
    public amount!: number
    public status!: string
    public stripe_payment_intent_id!: string
}

Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stripe_payment_intent_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
        underscored: true,
    }
)

export default Payment

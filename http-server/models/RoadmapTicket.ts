import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import User from './User'

interface RoadmapTicketAttributes {
    ticket_id: number
    user_id: number
    author: string
    title: string
    ticket_content: string
}

interface RoadmapTicketCreationAttributes
    extends Optional<RoadmapTicketAttributes, 'ticket_id'> {}

class RoadmapTicket
    extends Model<RoadmapTicketAttributes, RoadmapTicketCreationAttributes>
    implements RoadmapTicketAttributes
{
    public ticket_id!: number
    public user_id!: number
    public author!: string
    public title!: string
    public ticket_content!: string
}

RoadmapTicket.init(
    {
        ticket_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'user_id',
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User,
                key: 'username',
            },
        },
        ticket_content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'roadmap_ticket',
        timestamps: true,
        underscored: true,
    }
)

export default RoadmapTicket

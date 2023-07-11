import { DataTypes, Model, Optional } from "sequelize"
import sequelize from "../config/database"
import User from "./User"

interface ChatMessageAttributes {
    chat_message_id: number
    chatroom_id: string
    user_id: number
    content: string
    is_flagged: boolean
    reporter_id?: string
    author: string
}

interface ChatMessageCreationAttributes
    extends Optional<ChatMessageAttributes, "chat_message_id"> {}

class ChatMessage
    extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
    implements ChatMessageAttributes
{
    public chat_message_id!: number
    public chatroom_id!: string
    public user_id!: number
    public content!: string
    public is_flagged!: boolean
    public reporter_id?: string
    public author!: string
}

ChatMessage.init(
    {
        chat_message_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        chatroom_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "user_id",
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_flagged: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        reporter_id: {
            type: DataTypes.STRING,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "chat_message",
        timestamps: true,
        underscored: true,
    }
)

export default ChatMessage

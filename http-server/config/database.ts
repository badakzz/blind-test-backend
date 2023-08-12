import { Sequelize } from 'sequelize'

const {
    POSTGRES_HOST,
    POSTGRES_DATABASE,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
} = process.env

if (!POSTGRES_DATABASE || !POSTGRES_USER || !POSTGRES_PASSWORD) {
    throw new Error('Database configuration variables are missing.')
}

const sequelize = new Sequelize(
    POSTGRES_DATABASE,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    {
        host: POSTGRES_HOST,
        port: Number(POSTGRES_PORT),
        dialect: 'postgres',
        logging: false,
    }
)

export default sequelize

import express from 'express'
import sequelize from '../config/database'

const router = express.Router()

router.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate()
        res.status(200).send({
            status: 'ok',
            database: 'online',
            timestamp: new Date(),
        })
    } catch (error) {
        res.status(503).send({
            status: 'error',
            database: 'offline',
            error: error.message,
            timestamp: new Date(),
        })
    }
})

export default router

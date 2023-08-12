import { NextFunction } from 'express'

export const sequelizeErrorHandler = (error) => {
    if (error.name === 'SequelizeDatabaseError') {
        console.error(
            'Database Error:',
            error.message,
            error.name,
            error.parent,
            error.sql
        )
    } else {
        console.error('Error:', error.message)
    }
}

export const internalServerErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('An error occurred:', err)
    //@ts-ignore
    res.status(500).json({ error: 'Internal server error' })
}

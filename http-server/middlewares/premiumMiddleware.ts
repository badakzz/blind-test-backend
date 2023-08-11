import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models'

export const requirePremium = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1]
    console.log('premium middleware triggered')
    if (token) {
        console.log('verifying token from server', token)
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            async (err: any, decoded: any) => {
                if (err) {
                    console.log('error on jwt validation', err)
                    return res.status(401).json({ error: 'Invalid token' })
                } else {
                    const user = await User.findByPk(decoded.userId)
                    //@ts-ignore
                    const userPermissions = user?.dataValues.permissions
                    //@ts-ignore
                    if (userPermissions !== 2) {
                        return res
                            .status(403)
                            .send(
                                'You must be a premium user to access this resource.'
                            )
                    }
                    next()
                }
            }
        )
    } else {
        res.status(401).json({ error: 'Missing token' })
    }
}

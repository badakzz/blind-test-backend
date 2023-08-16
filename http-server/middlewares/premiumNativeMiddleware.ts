import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models'

export const requireNativePremium = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('Premium middleware triggered')
    let token = null
    const parts = req.headers.authorization.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
    }
    if (token) {
        console.log('Verifying token from server', token)
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            async (err: any, decoded: any) => {
                if (err) {
                    console.log('Error on jwt validation', err)
                    return res.status(401).json({ error: 'Invalid token' })
                } else {
                    const user = await User.findByPk(decoded.userId)
                    //@ts-ignore
                    console.log('decode', decoded.userId)
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

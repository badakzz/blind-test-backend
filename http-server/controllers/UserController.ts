import { Request, Response } from 'express'
import User from '../models/User'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'
import { createDTOOmittingPassword } from '../../http-server/utils/helpers'
import { v4 as uuidv4 } from 'uuid'

class UserController {
    static async getUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await User.findByPk(req.params.id)
            const userDTO = createDTOOmittingPassword(user)
            res.json(userDTO)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async getUserById(userId: number) {
        let user = await User.findOne({
            where: { user_id: userId },
        })
        if (user) return user
    }

    static async getUserByEmail(email: string) {
        let user = await User.findOne({
            where: { email },
        })
        if (user) return user
    }

    static async getUserByUsername(username: string) {
        let user = await User.findOne({
            where: { username },
        })
        if (user) return user
    }

    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            let newUser
            if (req.body.is_guest) {
                const guestUsername = 'Guest_' + uuidv4().slice(0, 8)
                newUser = await User.create({
                    username: guestUsername,
                    is_guest: true,
                    email: null,
                    password: null,
                    permissions: 0,
                    is_active: true,
                })
            } else {
                newUser = await User.create(req.body)
            }

            const userDTO = createDTOOmittingPassword(newUser)
            res.json({ user: userDTO })
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            await User.update(req.body, { where: { user_id: req.params.id } })
            const updatedUser = await User.findByPk(req.params.id)
            const userDTO = createDTOOmittingPassword(updatedUser)
            res.json(userDTO)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async partialUpdateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { body } = req
            await User.update(body, { where: { user_id: id } })
            const updatedUser = await User.findByPk(id)
            const userDTO = createDTOOmittingPassword(updatedUser)
            res.json(userDTO)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    static async deleteUserByEmail(email): Promise<void> {
        try {
            await User.destroy({ where: { email } })
        } catch (error) {
            sequelizeErrorHandler(error)
            console.error('Error deleting user:', error)
        }
    }

    static async deleteUserByUsername(username): Promise<void> {
        try {
            await User.destroy({ where: { username } })
        } catch (error) {
            sequelizeErrorHandler(error)
            console.error('Error deleting user:', error)
        }
    }

    static async grantPremium(req: Request, res: Response): Promise<void> {
        try {
            const { user_id } = req.body
            await User.update({ permissions: 2 }, { where: { user_id } })
            const updatedUser = await User.findByPk(user_id)
            const userDTO = createDTOOmittingPassword(updatedUser)
            res.json(userDTO)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default UserController

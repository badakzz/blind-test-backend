import { Request, Response } from 'express'
import User from '../models/User'
import { sequelizeErrorHandler } from '../../http-server/utils/ErrorHandlers'
import { createDTOOmittingPassword } from '../../http-server/utils/helpers'

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

    static async getUserById(user_id: number) {
        let user = await User.findOne({
            where: { user_id: user_id },
        })
        if (user) return user
    }

    static async getUserByEmail(email: string) {
        let user = await User.findOne({
            where: { email: email },
        })
        if (user) return user
    }

    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const newUser = await User.create(req.body)
            const userDTO = createDTOOmittingPassword(newUser)
            res.json(userDTO)
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

    static async deleteUser(email): Promise<void> {
        try {
            await User.destroy({ where: { email } })
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

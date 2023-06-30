import { Request, Response } from 'express'
import User from '../models/User'
import { sequelizeErrorHandler } from '../utils/ErrorHandlers'
import { createDTOOmittingPassword } from '../utils/helpers'

class UserController {
    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await User.findByPk(req.params.id)
            // Transform the user object to a custom DTO
            const userDTO = createDTOOmittingPassword(user)
            res.json(userDTO)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const newUser = await User.create(req.body)
            const userDTO = createDTOOmittingPassword(newUser)
            res.json(userDTO)
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
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

    async partialUpdateUser(req: Request, res: Response): Promise<void> {
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

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            await User.destroy({ where: { user_id: req.params.id } })
            res.json({ message: 'User deleted' })
        } catch (error) {
            sequelizeErrorHandler(error)
            res.status(500).send(error.message)
        }
    }
}

export default new UserController()

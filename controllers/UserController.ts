import { Request, Response } from 'express'
import User from '../models/User'
import { classToPlain } from 'class-transformer'
import { createDTOOmittingPassword } from '../utils/helpers'

class UserController {
    async getUser(req: Request, res: Response): Promise<void> {
        const user = await User.findByPk(req.params.id)

        // Transform the user object to a custom DTO
        const userDTO = createDTOOmittingPassword(user)
        res.json(userDTO)
    }

    async createUser(req: Request, res: Response): Promise<void> {
        const newUser = await User.create(req.body)
        const userDTO = createDTOOmittingPassword(newUser)
        res.json(userDTO)
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        await User.update(req.body, { where: { user_id: req.params.id } })
        const updatedUser = await User.findByPk(req.params.id)
        const userDTO = createDTOOmittingPassword(updatedUser)
        res.json(userDTO)
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        await User.destroy({ where: { user_id: req.params.id } })
        res.json({ message: 'User deleted' })
    }
}

export default new UserController()

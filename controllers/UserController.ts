import { Request, Response } from 'express'
import User from '../models/User'

class UserController {
    async getUser(req: Request, res: Response): Promise<void> {
        const user = await User.findByPk(req.params.id)
        res.json(user)
    }

    async createUser(req: Request, res: Response): Promise<void> {
        const newUser = await User.create(req.body)
        res.json(newUser)
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        await User.update(req.body, { where: { user_id: req.params.id } })
        const updatedUser = await User.findByPk(req.params.id)
        res.json(updatedUser)
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        await User.destroy({ where: { user_id: req.params.id } })
        res.json({ message: 'User deleted' })
    }
}

export default new UserController()

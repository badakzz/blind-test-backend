import { Request, Response } from 'express'
import RoadmapTicket from '../models/RoadmapTicket'
import { User } from '../models'

class RoadmapTicketController {
    static async createTicket(req: Request, res: Response): Promise<void> {
        try {
            const ticket = await RoadmapTicket.create(req.body)
            res.json(ticket)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    static async getTicket(req: Request, res: Response): Promise<void> {
        try {
            const ticket = await RoadmapTicket.findByPk(req.params.id)
            res.json(ticket)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    static async updateTicket(req: Request, res: Response): Promise<void> {
        try {
            await RoadmapTicket.update(req.body, {
                where: { ticket_id: req.params.id },
            })
            const updatedTicket = await RoadmapTicket.findByPk(req.params.id)
            res.json(updatedTicket)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    static async deleteTicket(req: Request, res: Response): Promise<void> {
        try {
            await RoadmapTicket.destroy({ where: { ticket_id: req.params.id } })
            res.json({ message: 'Ticket deleted' })
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    static async getAllTickets(req, res) {
        try {
            const tickets = await RoadmapTicket.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['username'],
                    },
                ],
            })
            const formattedTickets = tickets.map((ticket) => ({
                ticketId: ticket.ticket_id,
                author: ticket.author,
                title: ticket.title,
                ticketContent: ticket.ticket_content,
            }))
            res.json(formattedTickets)
        } catch (error) {
            console.error(error)
            res.status(500).send(error.message)
        }
    }
}

export default RoadmapTicketController

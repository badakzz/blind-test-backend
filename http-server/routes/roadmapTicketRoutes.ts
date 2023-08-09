import { Router } from 'express'
import RoadmapTicketController from '../controllers/RoadmapTicketController'

const router = Router()

// router.post('/api/v1/roadmap_tickets', RoadmapTicketController.createTicket)
// router.get('/api/v1/roadmap_tickets/:id', RoadmapTicketController.getTicket)
// router.put('/api/v1/roadmap_tickets/:id', RoadmapTicketController.updateTicket)
// router.delete(
//     '/api/v1/roadmap_tickets/:id',
//     RoadmapTicketController.deleteTicket
// )
router.get('/api/v1/roadmap_tickets/', RoadmapTicketController.getAllTickets)

export default router

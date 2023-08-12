import { Router } from 'express'
import RoadmapTicketController from '../controllers/RoadmapTicketController'

const router = Router()

router.get('/api/v1/roadmap_tickets/', RoadmapTicketController.getAllTickets)

export default router

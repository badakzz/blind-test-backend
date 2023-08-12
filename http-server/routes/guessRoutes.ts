import express from 'express'
import GuessController from '../controllers/GuessController'

const router = express.Router()

router.get('/api/guess/:chatroomId', GuessController.getGuess)

export default router

import express from 'express'
import GameController from '../controllers/GameController'

const router = express.Router()

router.post('/api/game/start/:chatroom_id/:playlist_id', async (req, res) => {
    const chatroomId = req.params.chatroom_id
    const playlistId = Number(req.params.playlist_id)

    try {
        const song = await GameController.startGame(chatroomId, playlistId)
        res.json({ previewUrl: song.preview_url })
    } catch (error) {
        res.status(500).json({ error: error.toString() })
    }
})

router.get('/api/game/next-song/:chatroomId', async (req, res) => {
    const chatroomId = req.params.chatroomId

    try {
        const song = await GameController.nextSong(chatroomId)
        res.json({ previewUrl: song.preview_url })
    } catch (error) {
        res.status(500).json({ error: error.toString() })
    }
})

export default router

import { requireCsrf } from "../middlewares/csrfMiddleware"
import express from "express"
import SongController from "../controllers/SongController"

const router = express.Router()

router.get("/api/v1/songs/", SongController.getSongs)
router.get("/api/v1/songs/:id", SongController.getSong)
router.post("/api/v1/songs/", requireCsrf, SongController.createSong)
router.delete("/api/v1/songs/:id", requireCsrf, SongController.deleteSong)

export default router

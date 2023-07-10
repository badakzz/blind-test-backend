import { Request, Response } from "express"
import Guess from "../models/Guess"

class GuessController {
    static async getGuess(req: Request, res: Response) {
        const guess = await Guess.findOne({
            where: { chatroom_id: req.params.chatroomId },
            include: ["song", "songGuesser", "artistGuesser"],
        })
        res.json(guess)
    }
}

export default GuessController

import { Request, Response, NextFunction } from 'express'
import { withCsrf } from '../controllers/CSRFController'

export const requireCsrf = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    withCsrf(req, res, next)
}

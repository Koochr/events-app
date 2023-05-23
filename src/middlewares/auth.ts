import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
import db from "../db"

export const jwtSecret = process.env.JWT_SECRET ?? "your-secret-key"

interface TokenPayload {
  id: string
}

export const checkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      res.status(401).json({error: "Unauthorized"})
      return
    }

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload

    // Check if the user exists in the database
    const user = await db("users").where("id", decoded.id).first()
    if (!user) {
      res.status(401).json({error: "Unauthorized"})
      return
    }

    // eslint-disable-next-line no-param-reassign
    req.user = user.id
    next()
  } catch (error) {
    console.error("Error checking token:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

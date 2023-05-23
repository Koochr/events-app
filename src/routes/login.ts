import {Request, Response} from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import db from "../db"
import {jwtSecret} from "../middlewares/auth"

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User login successful
 *       '401':
 *         description: Unauthorized
 *       '400':
 *         description: Bad request
 *       default:
 *         description: Unexpected error
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, password} = req.body

    if (!email || !password) {
      res.status(400).json({error: "Missing required parameters"})
      return
    }

    // Check if the user exists in the database
    const user = await db("users").where({email}).first()
    if (!user) {
      res.status(401).json({error: "Invalid email or password"})
      return
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      res.status(401).json({error: "Invalid email or password"})
      return
    }

    // Generate a JWT token with the user's email as the payload
    const token = jwt.sign({id: user.id}, jwtSecret, {expiresIn: "24h"})

    res.status(200).json({token})
  } catch (error) {
    console.error("Error logging in user:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

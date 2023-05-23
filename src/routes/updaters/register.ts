import {Request, Response} from "express"
import bcrypt from "bcrypt"
import knex from "../../db"

/**
 * @openapi
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User registration successful
 *       '400':
 *         description: Bad request
 *       default:
 *         description: Unexpected error
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {name, email, password} = req.body

    if (!name || !email || !password) {
      res.status(400).json({error: "Missing required parameters"})
      return
    }

    const user = await knex("users").where("email", email).first()
    if (user) {
      res.status(400).json({error: "User already exists"})
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert the new user into the users table
    const [userId] = await knex("users")
      .insert({
        name,
        email,
        password: hashedPassword
      })
      .returning("id")

    res.status(201).json({userId, message: "User registered successfully"})
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

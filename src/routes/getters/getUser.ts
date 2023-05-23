import {Request, Response} from "express"
import db from "../../db"

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user information
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User information retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       default:
 *         description: Unexpected error
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id

    // Retrieve the user from the database excluding the password field
    const user = await db("users").where("id", userId).select("id", "name", "email").first()

    if (!user) {
      res.status(404).json({error: "User not found"})
      return
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error retrieving user:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

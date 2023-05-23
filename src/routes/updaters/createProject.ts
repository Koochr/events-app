import {Request, Response} from "express"
import db from "../../db"

/**
 * @openapi
 * /api/create_project:
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Project created successfully
 *       '401':
 *         description: Unauthorized
 *       default:
 *         description: Unexpected error
 */
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {name, description} = req.body

    if (!name) {
      res.status(400).json({error: "Missing required parameters"})
      return
    }

    // Insert the new project into the project_created_events table
    const [projectId] = await db("project_created_events")
      .insert({
        user_id: req.user,
        name,
        description
      })
      .returning("project_id")

    res.status(201).json({projectId, message: "Project created successfully"})
  } catch (error) {
    console.error("Error creating project:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

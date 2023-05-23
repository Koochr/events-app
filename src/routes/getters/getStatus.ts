import {Request, Response} from "express"
import db from "../../db"

/**
 * @openapi
 * /api/projects/{id}/statuses:
 *   get:
 *     summary: Get project statuses
 *     tags:
 *       - Status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Project statuses retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       default:
 *         description: Unexpected error
 */
export const getStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id

    // Retrieve all project statuses from the database
    const statuses = await db("task_status_created_events")
      .select("status_id", "name", "color", "index")
      .where("project_id", projectId)
      .orderBy("index")

    res.status(200).json(statuses)
  } catch (error) {
    console.error("Error retrieving project statuses:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/add_status:
 *   post:
 *     summary: Add a status to a project
 *     tags:
 *       - Status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               index:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Status added successfully
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Project not found
 *       default:
 *         description: Unexpected error
 */
export const addStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const {projectId, name, color, index} = req.body

    if (!projectId || !name || !color || index == null || isNaN(index)) {
      res.status(400).json({error: "Missing required fields"})
      return
    }

    // Check if the user performing the request is a member of the project
    const currentUser = req.user
    const isCurrentUserMember = await isProjectMember(currentUser, projectId)
    if (!isCurrentUserMember) {
      res.status(403).json({error: "Forbidden"})
      return
    }

    const existingStatus = await db("task_status_created_events")
      .where({project_id: projectId, index})
      .first()

    if (existingStatus) {
      res.status(400).json({error: "Status with this index already exists"})
      return
    }

    // Write the statusAdded event to the status_added_events table
    await db("task_status_created_events").insert({
      project_id: projectId,
      name,
      color,
      index
    })

    res.status(201).json({message: "Status added successfully"})
  } catch (error) {
    console.error("Error adding status:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}

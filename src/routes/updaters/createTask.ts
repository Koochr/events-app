import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/create_task:
 *   post:
 *     summary: Create a new task in a project
 *     tags:
 *       - Task
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
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Task created successfully
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Project not found
 *       default:
 *         description: Unexpected error
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const {projectId, name, description} = req.body

    // Validate mandatory fields
    if (!projectId || !name) {
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

    // Write the taskCreated event to the task_created_events table
    const [taskId] = await db("task_created_events")
      .insert({
        project_id: projectId,
        name,
        description
      })
      .returning("id")

    res.status(201).json({taskId, message: "Task created successfully"})
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
